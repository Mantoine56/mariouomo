import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { SearchProductsDto, ProductSortField } from '../dtos/search-products.dto';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { ProductVariant } from '../entities/product-variant.entity';

/**
 * Repository for Product entity
 * Extends BaseRepository to inherit common CRUD operations
 * Implements specialized product-specific operations including full-text search
 */
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  private readonly logger = new Logger(ProductRepository.name);
  private readonly variantRepository: Repository<ProductVariant>;

  constructor(
    @InjectRepository(ProductVariant)
    variantRepository: Repository<ProductVariant>,
    entityManager: EntityManager
  ) {
    super(Product, entityManager);
    this.variantRepository = variantRepository;
  }

  /**
   * Create a new product with optional variants
   * @param createProductDto Product data
   * @returns Created product
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { variants, category_ids, ...productData } = createProductDto;
    
    // Create product entity
    const product = this.create(productData);
    await this.save(product);
    
    // Create variants if provided
    if (variants?.length) {
      // Create individual variants to avoid array nesting issues
      for (const variantData of variants) {
        const variant = this.variantRepository.create({
          ...variantData,
          product_id: product.id
        });
        await this.variantRepository.save(variant);
      }
      
      // Fetch the newly created variants
      product.variants = await this.variantRepository.find({
        where: { product_id: product.id }
      });
    }
    
    // Add categories if provided
    if (category_ids?.length) {
      // Use em method from BaseRepository
      await this.getEntityManager().createQueryBuilder()
        .insert()
        .into('product_categories')
        .values(
          category_ids.map(category_id => ({
            product_id: product.id,
            category_id
          }))
        )
        .execute();
    }
    
    return product;
  }

  /**
   * Update an existing product
   * @param id Product ID
   * @param updateProductDto Update data
   * @returns Updated product
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const { variants, category_ids, ...productData } = updateProductDto;
    
    // Update product
    await this.update(id, productData);
    
    // Update variants if provided
    if (variants?.length) {
      const product = await this.findOne({
        where: { id },
        relations: ['variants']
      });
      
      if (product) {
        // Delete existing variants
        if (product.variants?.length) {
          await this.variantRepository.delete({ product_id: id });
        }
        
        // Create individual variants to avoid array nesting issues
        for (const variantData of variants) {
          const variant = this.variantRepository.create({
            ...variantData,
            product_id: id
          });
          await this.variantRepository.save(variant);
        }
        
        // Fetch the newly created variants
        product.variants = await this.variantRepository.find({
          where: { product_id: id }
        });
        
        // Update categories if provided
        if (category_ids?.length) {
          // First delete existing categories
          await this.getEntityManager().createQueryBuilder()
            .delete()
            .from('product_categories')
            .where('product_id = :id', { id })
            .execute();
            
          // Then add new categories
          await this.getEntityManager().createQueryBuilder()
            .insert()
            .into('product_categories')
            .values(
              category_ids.map(category_id => ({
                product_id: id,
                category_id
              }))
            )
            .execute();
        }
        
        return this.save(product);
      }
    }
    
    return this.getProductById(id);
  }

  /**
   * Get product by ID with all relations
   * @param id Product ID
   * @returns Product with variants, categories, and images
   * @throws NotFoundException if product not found
   */
  async getProductById(id: string): Promise<Product> {
    // Use same approach as other methods to avoid deleted_at issues
    const product = await this.createQueryBuilder('product')
      // Use explicit joins to avoid automatic soft delete conditions
      .leftJoin('product.variants', 'variants')
      .leftJoin('product.categories', 'categories')
      .leftJoin('product.images', 'images')
      // Only select needed columns to avoid issues with missing columns
      .addSelect('variants.id')
      .addSelect('variants.name')
      .addSelect('variants.sku')
      .addSelect('variants.price_adjustment')
      .addSelect('categories.id')
      .addSelect('categories.name')
      .addSelect('images.id')
      .addSelect('images.original_url')
      .addSelect('images.thumbnail_url')
      .where('product.id = :id', { id })
      .andWhere('product.deleted_at IS NULL')
      .getOne();
      
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    
    return product;
  }

  /**
   * Search products using full-text search and filters
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Paginated products matching search criteria
   */
  public async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    const { query, categories, minPrice, maxPrice, sortBy, sortOrder } = searchDto;
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    
    try {
      this.logger.log('Starting product search query construction');
      
      // Simplified approach without joins to avoid deleted_at column issues
      const qb = this.createQueryBuilder('product')
        .where('product.deleted_at IS NULL');
      
      this.logger.log('Base query builder created');
      
      // Apply full-text search if query provided
      if (query) {
        this.logger.log(`Applying text search for query: ${query}`);
        qb.andWhere(
          "to_tsvector('english', product.name || ' ' || product.description) @@ plainto_tsquery('english', :query)",
          { query }
        );
      }

      // Apply category filter - need to use subquery for categories since we're avoiding joins
      if (categories?.length) {
        this.logger.log(`Filtering by categories: ${categories.join(', ')}`);
        qb.andWhere(
          'product.id IN (SELECT product_id FROM product_categories WHERE category_id IN (:...categories))',
          { categories }
        );
      }

      // Apply price range filter
      if (typeof minPrice === 'number') {
        this.logger.log(`Filtering by minimum price: ${minPrice}`);
        qb.andWhere('product.price >= :minPrice', { minPrice });
      }
      if (typeof maxPrice === 'number') {
        this.logger.log(`Filtering by maximum price: ${maxPrice}`);
        qb.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      // Apply sorting
      switch (sortBy) {
        case ProductSortField.NAME:
          this.logger.log(`Sorting by name: ${sortOrder}`);
          qb.orderBy('product.name', sortOrder);
          break;
        case ProductSortField.PRICE:
          this.logger.log(`Sorting by price: ${sortOrder}`);
          qb.orderBy('product.price', sortOrder);
          break;
        case ProductSortField.CREATED_AT:
          this.logger.log(`Sorting by created_at: ${sortOrder}`);
          qb.orderBy('product.created_at', sortOrder);
          break;
        case ProductSortField.UPDATED_AT:
          this.logger.log(`Sorting by updated_at: ${sortOrder}`);
          qb.orderBy('product.updated_at', sortOrder);
          break;
        default:
          this.logger.log('Using default sort by created_at DESC');
          qb.orderBy('product.created_at', 'DESC');
      }

      // Log the SQL query being executed
      const rawQuery = qb.getSql();
      this.logger.log(`Executing SQL query: ${rawQuery}`);

      // Execute the query and count
      try {
        // Count total before pagination
        const total = await qb.getCount();
        
        // Apply pagination
        this.logger.log(`Applying pagination: skip=${skip}, limit=${limit}`);
        qb.skip(skip).take(limit);
        
        // Get products
        const items = await qb.getMany();
        
        this.logger.debug(`Found ${total} products matching search criteria`);

        // Return paginated result
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        };
      } catch (queryError) {
        this.logger.error(`Database query error: ${queryError.message}`);
        this.logger.error(`SQL error details: ${JSON.stringify(queryError)}`);
        throw queryError;
      }
    } catch (error) {
      this.logger.error(`Error searching products: ${error.message}`, error.stack);
      this.logger.error(`Complete error object: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Find products by store ID with pagination and filtering
   * @param storeId Store ID
   * @param query Pagination parameters
   * @returns Paginated products for the store
   */
  async findByStoreId(storeId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    
    // Use the same approach as searchProducts to avoid deleted_at issues
    const qb = this.createQueryBuilder('product')
      // Use explicit joins to avoid automatic soft delete conditions
      .leftJoin('product.variants', 'variants')
      .leftJoin('product.categories', 'categories')
      .leftJoin('product.images', 'images')
      // Only select needed columns to avoid issues with missing columns
      .addSelect('variants.id')
      .addSelect('variants.name')
      .addSelect('variants.sku')
      .addSelect('variants.price_adjustment')
      .addSelect('categories.id')
      .addSelect('categories.name')
      .addSelect('images.id')
      .addSelect('images.original_url')
      .addSelect('images.thumbnail_url')
      .where('product.store_id = :storeId', { storeId })
      .andWhere('product.deleted_at IS NULL');

    // Apply search if provided
    if (search) {
      qb.andWhere(
        "to_tsvector('english', product.name || ' ' || product.description) @@ plainto_tsquery('english', :search)",
        { search }
      );
    }

    // Count total before pagination
    const total = await qb.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    // Get products
    const products = await qb.getMany();

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Adds a variant to a product
   * @param productId - The ID of the product to add the variant to
   * @param variantData - The variant data to add
   * @returns The created product variant
   */
  async addVariant(productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    const product = await this.findOne({ where: { id: productId } });
    
    if (!product) {
      this.logger.error(`Product with ID ${productId} not found`);
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    const variant = this.variantRepository.create({
      ...variantData,
      product
    });
    
    return this.variantRepository.save(variant);
  }

  /**
   * Helper method to access entity manager from BaseRepository
   * @returns EntityManager instance
   */
  private getEntityManager(): EntityManager {
    // Access the entity manager provided in the constructor
    return this.repository.manager;
  }
}