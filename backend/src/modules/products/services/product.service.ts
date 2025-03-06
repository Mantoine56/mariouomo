import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { SearchProductsDto } from '../dtos/search-products.dto';
import { PaginationQueryDto } from '@common/dtos/pagination.dto';
import { CacheService } from '@common/cache/cache.service';
import { ProductImage } from '../entities/product-image.entity';
import { ProductImageRepository } from '../repositories/product-image.repository';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly CACHE_KEY_PREFIX = 'product:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectRepository(ProductRepository)
    private readonly productRepository: ProductRepository,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: ProductImageRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new product with variants
   * @param createProductDto The product data to create
   * @returns The created product with variants
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.debug(`Creating product: ${JSON.stringify(createProductDto)}`);
    
    const product = await this.productRepository.createProduct(createProductDto);
    await this.invalidateCache();
    
    return product;
  }

  /**
   * Update an existing product
   * @param id The product ID
   * @param updateProductDto The product data to update
   * @returns The updated product
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    this.logger.debug(`Updating product ${id}: ${JSON.stringify(updateProductDto)}`);
    
    const product = await this.productRepository.updateProduct(id, updateProductDto);
    await this.invalidateCache(id);
    
    return product;
  }

  /**
   * Get a product by ID
   * @param id The product ID
   * @returns The product with variants
   */
  async getProduct(id: string): Promise<Product> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      this.logger.debug(`Cache hit for product ${id}`);
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached product: ${error.message}`);
      }
    }

    this.logger.debug(`Cache miss for product ${id}, fetching from database`);
    const product = await this.productRepository.getProductById(id);
    
    if (product) {
      try {
        await this.cacheService.set(cacheKey, JSON.stringify(product), this.CACHE_TTL);
      } catch (error) {
        this.logger.warn(`Failed to cache product: ${error.message}`);
      }
    }
    
    return product;
  }

  /**
   * Alias for getProduct to maintain backward compatibility
   * @param id The product ID
   * @returns The product with variants
   */
  async getProductById(id: string): Promise<Product> {
    return this.getProduct(id);
  }

  /**
   * Search products using full-text search
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Products matching the search criteria
   */
  async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}search:${JSON.stringify(searchDto)}:${JSON.stringify(paginationDto)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      this.logger.debug('Cache hit for product search');
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached search results: ${error.message}`);
      }
    }

    this.logger.debug('Cache miss for product search, fetching from database');
    const results = await this.productRepository.searchProducts(searchDto, paginationDto);
    
    try {
      await this.cacheService.set(cacheKey, JSON.stringify(results), this.CACHE_TTL);
    } catch (error) {
      this.logger.warn(`Failed to cache search results: ${error.message}`);
    }
    
    return results;
  }

  /**
   * Delete a product (soft delete)
   * @param id The product ID
   */
  async deleteProduct(id: string): Promise<void> {
    this.logger.debug(`Soft deleting product ${id}`);
    
    await this.productRepository.softDelete(id);
    await this.invalidateCache(id);
  }

  /**
   * Add an image to a product
   * @param productId Product ID
   * @param imageData Image URLs
   */
  async addProductImage(
    productId: string,
    imageData: { originalUrl: string; thumbnailUrl: string },
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create new image entity
    const image = new ProductImage();
    image.originalUrl = imageData.originalUrl;
    image.thumbnailUrl = imageData.thumbnailUrl;
    image.product = product;

    // Save image
    await this.productImageRepository.save(image);

    // Clear cache
    await this.cacheService.del(`product:${productId}`);
  }

  /**
   * Remove an image from a product
   * @param productId Product ID
   * @param imageId Image ID
   */
  async removeProductImage(productId: string, imageId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    // Remove image (using soft delete)
    await this.productImageRepository.softDelete(imageId);

    // Clear cache
    await this.cacheService.del(`product:${productId}`);
  }

  /**
   * Invalidate cache for a specific product or all products
   * @param id Optional product ID
   */
  private async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);
    }
    
    // Invalidate search cache
    const searchPattern = `${this.CACHE_KEY_PREFIX}search:*`;
    await this.cacheService.delPattern(searchPattern);
    
    this.logger.debug(`Cache invalidated for ${id ? `product ${id}` : 'all products'}`);
  }
}
