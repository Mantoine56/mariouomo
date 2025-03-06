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
    const { variants, ...productData } = createProductDto;
    
    // Create product entity
    const product = this.create(productData);
    await this.save(product);
    
    // Create variants if provided
    if (variants?.length) {
      const createdVariants = variants.map(variantData => {
        const variant = this.variantRepository.create({
          ...variantData,
          product_id: product.id
        });
        return variant;
      });
      
      await this.variantRepository.save(createdVariants);
      product.variants = createdVariants;
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
    const { variants, ...productData } = updateProductDto;
    
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
        
        // Create new variants
        const updatedVariants = variants.map(variantData => {
          return this.variantRepository.create({
            ...variantData,
            product_id: id
          });
        });
        
        // Save new variants
        await this.variantRepository.save(updatedVariants);
        
        // Update product with new variants
        product.variants = updatedVariants;
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
    const product = await this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.images', 'images')
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
  async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    const { query, categories, minPrice, maxPrice, sortBy, sortOrder } = searchDto;
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    
    // Create base query builder
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.deleted_at IS NULL');
    
    // Apply full-text search if query provided
    if (query) {
      qb.andWhere(
        "to_tsvector('english', product.name || ' ' || product.description) @@ plainto_tsquery('english', :query)",
        { query }
      );
    }

    // Apply category filter
    if (categories?.length) {
      qb.andWhere('categories.id IN (:...categories)', { categories });
    }

    // Apply price range filter
    if (typeof minPrice === 'number') {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (typeof maxPrice === 'number') {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply sorting
    switch (sortBy) {
      case ProductSortField.NAME:
        qb.orderBy('product.name', sortOrder);
        break;
      case ProductSortField.PRICE:
        qb.orderBy('product.price', sortOrder);
        break;
      case ProductSortField.CREATED_AT:
        qb.orderBy('product.created_at', sortOrder);
        break;
      case ProductSortField.UPDATED_AT:
        qb.orderBy('product.updated_at', sortOrder);
        break;
      default:
        qb.orderBy('product.created_at', 'DESC');
    }

    // Apply pagination
    qb.skip(skip).take(limit);

    try {
      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error(`Error searching products: ${error.message}`, error.stack);
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
    
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.images', 'images')
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
}