import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { SearchProductsDto } from '../dtos/search-products.dto';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { ProductImage } from '../entities/product-image.entity';
import { ProductImageRepository } from '../repositories/product-image.repository';
import { NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly CACHE_KEY_PREFIX = 'product:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
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
    
    // Manually load relations
    if (product) {
      await this.loadProductRelations(product);
      
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
   * Search products by criteria
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Paginated list of products matching criteria
   */
  async searchProducts(searchDto: SearchProductsDto, paginationDto: PaginationQueryDto) {
    // Ensure pagination parameters have default values
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    
    this.logger.log(`Searching products with page: ${page}, limit: ${limit}`);
    this.logger.log(`Search criteria: ${JSON.stringify(searchDto)}`);
    
    try {
      // Call repository method with simplified query
      const result = await this.productRepository.searchProducts(searchDto, paginationDto);
      
      this.logger.debug(`Search found ${result.items.length} products out of ${result.total} total`);
      this.logger.debug(`Pagination result: page ${result.page}/${result.totalPages}, hasNextPage: ${result.hasNextPage}`);
      
      // Manually load relations for better data consistency
      if (result.items.length > 0) {
        await this.loadProductsRelations(result.items);
        this.logger.debug(`Loaded relations for ${result.items.length} products from search results`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error searching products: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
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
    
    // Set the primary URL field (the actual database column)
    image.url = imageData.originalUrl;
    
    // These setter methods will map to the url field
    image.originalUrl = imageData.originalUrl;
    image.thumbnailUrl = imageData.thumbnailUrl;
    
    image.product_id = productId;
    
    // Log the mapping for debugging
    this.logger.debug(`Creating product image with url: ${image.url}, product_id: ${productId}`);
    
    // Save image
    await this.productImageRepository.save(image);

    // Clear cache
    await this.invalidateCache(productId);
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

    // Clear cache using the common invalidation method
    await this.invalidateCache(productId);
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

  /**
   * Manually load relationships for a product
   * This works around the soft-delete inconsistency by using separate queries
   * @param product The product to load relations for
   */
  private async loadProductRelations(product: Product): Promise<void> {
    if (!product) {
      this.logger.warn(`Cannot load relations for null product`);
      return;
    }
    
    this.logger.debug(`Loading relations for product ${product.id}`);
    const startTime = Date.now();
    
    try {
      // Load variants with safe handling
      const variantStartTime = Date.now();
      try {
        product.variants = await this.variantRepository.find({
          where: { product_id: product.id }
        });
        const variantTime = Date.now() - variantStartTime;
        this.logger.debug(`Loaded ${product.variants.length} variants for product ${product.id} in ${variantTime}ms`);
      } catch (variantError) {
        this.logger.error(`Failed to load variants for product ${product.id}: ${variantError.message}`);
        // Graceful degradation - set empty array instead of failing
        product.variants = [];
      }
      
      // Load images with safe handling
      const imageStartTime = Date.now();
      try {
        product.images = await this.productImageRepository.find({
          where: { product_id: product.id }
        });
        const imageTime = Date.now() - imageStartTime;
        this.logger.debug(`Loaded ${product.images.length} images for product ${product.id} in ${imageTime}ms`);
      } catch (imageError) {
        this.logger.error(`Failed to load images for product ${product.id}: ${imageError.message}`);
        // Graceful degradation - set empty array instead of failing
        product.images = [];
      }
      
      // Load categories with safe handling
      const categoryStartTime = Date.now();
      try {
        if (!product.categories || product.categories.length === 0) {
          // Simpler query to reduce complexity and avoid RLS issues
          const categoriesQuery = this.variantRepository.manager
            .createQueryBuilder()
            .select('c.id, c.name')
            .from('categories', 'c')
            .innerJoin('product_categories', 'pc', 'pc.category_id = c.id')
            .where('pc.product_id = :productId', { productId: product.id });
            
          product.categories = await categoriesQuery.getRawMany();
          const categoryTime = Date.now() - categoryStartTime;
          this.logger.debug(`Loaded ${product.categories.length} categories for product ${product.id} in ${categoryTime}ms`);
        }
      } catch (categoryError) {
        this.logger.error(`Failed to load categories for product ${product.id}: ${categoryError.message}`);
        // Graceful degradation - set empty array instead of failing
        product.categories = [];
      }
      
      const totalTime = Date.now() - startTime;
      this.logger.debug(`Successfully loaded all relations for product ${product.id} in ${totalTime}ms`);
    } catch (error) {
      // Log but don't throw - this allows the product to be returned even with incomplete relations
      this.logger.error(`Error in loadProductRelations for ${product.id}: ${error.message}`);
    }
  }
  
  /**
   * Manually load relationships for multiple products
   * @param products An array of products to load relations for
   */
  private async loadProductsRelations(products: Product[]): Promise<void> {
    if (!products?.length) return;
    
    try {
      const productIds = products.map(p => p.id);
      this.logger.debug(`Loading relations for ${productIds.length} products`);
      
      // Load variants for all products
      const variants = await this.variantRepository.find({
        where: { product_id: In(productIds) }
      });
      
      // Load images for all products
      const images = await this.productImageRepository.find({
        where: { product_id: In(productIds) }
      });
      
      // Load categories for all products using the entity manager
      const categoriesMap = await this.variantRepository.manager
        .createQueryBuilder()
        .select('pc.product_id')
        .addSelect('c.*')
        .from('categories', 'c')
        .innerJoin('product_categories', 'pc', 'pc.category_id = c.id')
        .where('pc.product_id IN (:...productIds)', { productIds })
        .getRawMany()
        .then((rows: any[]) => {
          const map = new Map<string, any[]>();
          rows.forEach((row: any) => {
            if (!map.has(row.product_id)) {
              map.set(row.product_id, []);
            }
            map.get(row.product_id)?.push(row);
          });
          return map;
        });
      
      // Assign relations to each product
      products.forEach(product => {
        product.variants = variants.filter(v => v.product_id === product.id);
        product.images = images.filter(i => i.product_id === product.id);
        product.categories = categoriesMap.get(product.id) || [];
      });
      
      this.logger.debug(`Successfully loaded relations for ${products.length} products`);
    } catch (error) {
      this.logger.error(`Failed to load relations for multiple products: ${error.message}`);
    }
  }

  /**
   * Get products by store ID with pagination
   * @param storeId The store ID
   * @param query Pagination and search options
   * @returns Paginated products for the store with all relations loaded
   */
  async getProductsByStoreId(storeId: string, query: PaginationQueryDto) {
    this.logger.debug(`Fetching products for store ${storeId} with query: ${JSON.stringify(query)}`);
    
    // Use the repository method with simplified query
    const result = await this.productRepository.findByStoreId(storeId, query);
    
    // Manually load relations for better data consistency
    if (result.items.length > 0) {
      await this.loadProductsRelations(result.items);
      this.logger.debug(`Loaded relations for ${result.items.length} products from store ${storeId}`);
    }
    
    return result;
  }
}
