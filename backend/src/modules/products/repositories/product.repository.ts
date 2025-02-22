import { EntityRepository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Product } from '../entities/product.entity';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { SearchProductsDto, ProductSortField } from '../dtos/search-products.dto';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Repository for Product entity
 * Extends BaseRepository to inherit common CRUD operations
 * Implements specialized product-specific operations including full-text search
 */
@Injectable()
@EntityRepository(Product)
export class ProductRepository extends BaseRepository<Product> {
  private readonly logger = new Logger(ProductRepository.name);

  /**
   * Create a new product with variants
   * @param createProductDto Product creation data
   * @returns Created product with variants
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { variants, ...productData } = createProductDto;
    
    // Create product entity
    const product = this.create(productData);
    
    // Create variants if provided
    if (variants?.length) {
      product.variants = variants.map(variant => this.create(variant));
    }
    
    return this.save(product);
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
      const product = await this.findOne(id, { relations: ['variants'] });
      product.variants = variants.map(variant => this.create(variant));
      return this.save(product);
    }
    
    return this.findOne(id, { relations: ['variants'] });
  }

  /**
   * Get product by ID with all relations
   * @param id Product ID
   * @returns Product with variants, categories, and images
   */
  async getProductById(id: string): Promise<Product> {
    return this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .andWhere('product.deleted_at IS NULL')
      .getOne();
  }

  /**
   * Search products using full-text search and filters
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Paginated products matching search criteria
   */
  async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    const { query, categories, minPrice, maxPrice, sortBy, sortOrder } = searchDto;
    const { page, limit } = paginationDto;

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
    const skip = (page - 1) * limit;
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
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.store_id = :storeId', { storeId })
      .andWhere('product.deleted_at IS NULL');

    // Apply search if provided
    if (query.search) {
      qb.andWhere(
        "to_tsvector('english', product.name || ' ' || product.description) @@ plainto_tsquery('english', :search)",
        { search: query.search }
      );
    }

    // Apply sorting
    if (query.sortBy) {
      qb.orderBy(`product.${query.sortBy}`, query.sortDirection);
    } else {
      qb.orderBy('product.created_at', 'DESC');
    }

    // Apply pagination
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    try {
      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page * query.limit < total,
        hasPreviousPage: query.page > 1,
      };
    } catch (error) {
      this.logger.error(`Error finding products by store: ${error.message}`, error.stack);
      throw error;
    }
  }
}
