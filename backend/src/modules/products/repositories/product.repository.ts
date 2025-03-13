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
import { ProductImage } from '../entities/product-image.entity';

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
    try {
      // Execute a completely raw query to bypass TypeORM's automatic soft delete handling
      const rawQuery = `
        SELECT 
          p.id as product_id, 
          p.name as product_name, 
          p.description as product_description,
          p.price as product_price,
          p.compare_at_price as product_compare_at_price,
          p.cost_price as product_cost_price,
          p.status as product_status,
          p.store_id as product_store_id,
          p.created_at as product_created_at,
          p.updated_at as product_updated_at,
          p.metadata as product_metadata,
          
          v.id as variants_id,
          v.sku as variants_sku,
          v.price_adjustment as variants_price_adjustment,
          v.option_values as variants_option_values,
          
          c.id as categories_id,
          c.name as categories_name,
          
          i.id as images_id,
          i.url as images_url,
          i.alt_text as images_alt_text
        FROM 
          products p
        LEFT JOIN 
          product_variants v ON v.product_id = p.id
        LEFT JOIN 
          product_categories pc ON pc.product_id = p.id
        LEFT JOIN 
          categories c ON c.id = pc.category_id AND c.deleted_at IS NULL
        LEFT JOIN 
          product_images i ON i.product_id = p.id
        WHERE 
          p.id = $1 AND p.deleted_at IS NULL
      `;
      
      // Execute raw query directly
      const result = await this.repository.manager.query(rawQuery, [id]);
      
      if (!result || result.length === 0) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
      }
      
      // Convert raw query result to proper Product entity with relations
      const productData = result[0];
      
      // Map base product properties
      const productEntity = new Product();
      productEntity.id = productData.product_id;
      productEntity.name = productData.product_name;
      productEntity.description = productData.product_description;
      productEntity.price = productData.product_price;
      productEntity.compare_at_price = productData.product_compare_at_price;
      productEntity.cost_price = productData.product_cost_price;
      productEntity.status = productData.product_status;
      productEntity.store_id = productData.product_store_id;
      productEntity.created_at = productData.product_created_at;
      productEntity.updated_at = productData.product_updated_at;
      productEntity.metadata = productData.product_metadata;
      
      // Map variants - group by variant ID to avoid duplicates
      const variantMap = new Map();
      result.forEach((row: any) => {
        if (row.variants_id && !variantMap.has(row.variants_id)) {
          const variant = new ProductVariant();
          variant.id = row.variants_id;
          variant.product_id = productEntity.id;
          variant.sku = row.variants_sku;
          variant.price_adjustment = row.variants_price_adjustment;
          variant.option_values = row.variants_option_values;
          variantMap.set(row.variants_id, variant);
        }
      });
      productEntity.variants = Array.from(variantMap.values());
      
      // Map images - group by image ID to avoid duplicates
      const imageMap = new Map();
      result.forEach((row: any) => {
        if (row.images_id && !imageMap.has(row.images_id)) {
          const image = new ProductImage();
          image.id = row.images_id;
          image.product_id = productEntity.id;
          image.url = row.images_url;
          image.alt = row.images_alt_text;
          imageMap.set(row.images_id, image);
        }
      });
      productEntity.images = Array.from(imageMap.values());
      
      // Map categories - group by category ID to avoid duplicates
      const categoryMap = new Map();
      result.forEach((row: any) => {
        if (row.categories_id && !categoryMap.has(row.categories_id)) {
          const category = {
            id: row.categories_id,
            name: row.categories_name
          };
          categoryMap.set(row.categories_id, category);
        }
      });
      productEntity.categories = Array.from(categoryMap.values());
      
      this.logger.debug(`Product ${id} loaded with ${productEntity.variants.length} variants, ${productEntity.images.length} images, and ${productEntity.categories?.length || 0} categories`);
      
      return productEntity;
    } catch (error) {
      this.logger.error(`Error fetching product ${id}: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Search products using full-text search and filters
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Paginated products matching search criteria
   */
  public async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    const { query, categories, minPrice, maxPrice, sortBy, sortOrder, status, metadata_category } = searchDto;
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    
    try {
      this.logger.log(`Building product search query for page ${page}, limit ${limit}, skip ${skip}`);
      
      // Simplified approach without joins to avoid deleted_at column issues
      const qb = this.createQueryBuilder('product')
        .where('product.deleted_at IS NULL');
      
      this.logger.debug('Base query builder created');
      
      // Apply metadata_category filter if provided
      if (metadata_category) {
        this.logger.debug(`Filtering by metadata.category: ${metadata_category}`);
        qb.andWhere(`product.metadata->>'category' = :metadata_category`, { metadata_category });
      }
      
      // Apply status filter if provided
      if (status) {
        this.logger.debug(`Filtering by status: ${status}`);
        qb.andWhere('product.status = :status', { status });
      }
      
      // Apply full-text search if query provided
      if (query) {
        this.logger.debug(`Applying enhanced text search for query: ${query}`);
        
        // Split query into individual words for more comprehensive search
        const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
        
        if (searchTerms.length > 0) {
          // Create a search expression that matches any of the words in name or description
          // Using ILIKE with wildcards for partial matches
          const searchConditions = searchTerms.map((term, index) => {
            const paramName = `searchTerm${index}`;
            return `(product.name ILIKE :${paramName} OR product.description ILIKE :${paramName})`;
          });
          
          // Combine all search conditions with OR to match any term
          qb.andWhere(`(${searchConditions.join(' OR ')})`, 
            searchTerms.reduce((params: Record<string, string>, term, index) => {
              params[`searchTerm${index}`] = `%${term}%`;
              return params;
            }, {})
          );
        }
      }

      // Apply category filter - need to use subquery for categories since we're avoiding joins
      if (categories?.length) {
        this.logger.debug(`Filtering by categories: ${categories.join(', ')}`);
        qb.andWhere(
          'product.id IN (SELECT product_id FROM product_categories WHERE category_id IN (:...categories))',
          { categories }
        );
      }

      // Apply price range filter
      if (typeof minPrice === 'number') {
        this.logger.debug(`Filtering by minimum price: ${minPrice}`);
        qb.andWhere('product.price >= :minPrice', { minPrice });
      }
      if (typeof maxPrice === 'number') {
        this.logger.debug(`Filtering by maximum price: ${maxPrice}`);
        qb.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      // Apply sorting
      switch (sortBy) {
        case ProductSortField.NAME:
          this.logger.debug(`Sorting by name: ${sortOrder}`);
          qb.orderBy('product.name', sortOrder);
          break;
        case ProductSortField.PRICE:
          this.logger.debug(`Sorting by price: ${sortOrder}`);
          qb.orderBy('product.price', sortOrder);
          break;
        case ProductSortField.CREATED_AT:
          this.logger.debug(`Sorting by created_at: ${sortOrder}`);
          qb.orderBy('product.created_at', sortOrder);
          break;
        case ProductSortField.UPDATED_AT:
          this.logger.debug(`Sorting by updated_at: ${sortOrder}`);
          qb.orderBy('product.updated_at', sortOrder);
          break;
        default:
          this.logger.debug('Using default sort by created_at DESC');
          qb.orderBy('product.created_at', 'DESC');
      }
      
      // Count total products matching the query before pagination
      const totalQb = this.createQueryBuilder('product');
      
      // Apply same WHERE conditions manually instead of using qb.getQuery()
      // This avoids the "subquery must return only one column" error
      
      // Copy the WHERE conditions without copying the SELECT/FROM part
      const whereExpressions = qb.expressionMap.wheres;
      
      if (whereExpressions && whereExpressions.length > 0) {
        // Apply the same where conditions individually
        for (const expr of whereExpressions) {
          if (expr.type === 'simple') {
            totalQb.andWhere(expr.condition, qb.getParameters());
          } else if (expr.type === 'and') {
            totalQb.andWhere(expr.condition, qb.getParameters());
          } else if (expr.type === 'or') {
            totalQb.orWhere(expr.condition, qb.getParameters());
          }
        }
      }
      
      // Select count after applying the WHERE conditions
      totalQb.select('COUNT(DISTINCT product.id)', 'count');
        
      // Get the count result
      const { count } = await totalQb.getRawOne();
      const total = parseInt(count, 10);
      
      this.logger.debug(`Total products matching query: ${total}`);

      // Apply pagination
      qb.skip(skip).take(limit);
      
      // Log the final query for debugging
      const finalQuery = qb.getQuery();
      const finalParams = qb.getParameters();
      
      this.logger.debug(`Final query: ${finalQuery}`);
      this.logger.debug(`Query parameters: ${JSON.stringify(finalParams)}`);
      
      // Execute the query
      const items = await qb.getMany();
      
      this.logger.debug(`Query returned ${items.length} products for page ${page}`);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      
      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage
      };
    } catch (error) {
      this.logger.error(`Error executing product search: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
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
    try {
      const { page = 1, limit = 10, search } = query;
      
      // Use direct table names instead of entity relations to avoid deleted_at issues
      const qb = this.createQueryBuilder('product')
        // Custom joins with manual conditions
        .leftJoinAndSelect(
          'product_variants',
          'variants',
          'variants.product_id = product.id'
        )
        .leftJoinAndSelect(
          'product_categories',
          'product_categories',
          'product_categories.product_id = product.id'
        )
        .leftJoinAndSelect(
          'categories',
          'categories',
          'categories.id = product_categories.category_id AND categories.deleted_at IS NULL'
        )
        .leftJoinAndSelect(
          'product_images',
          'images',
          'images.product_id = product.id'
        )
        // Only select needed columns that actually exist in the database
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
      
      // Note: Relations are loaded by product service's loadProductsRelations method, 
      // which will be called after this repository method returns

      return {
        items: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error(`Error fetching products for store ${storeId}: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
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