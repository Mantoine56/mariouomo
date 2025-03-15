import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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
import { EntityManager } from 'typeorm';

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
    private readonly entityManager: EntityManager,
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
    try {
      // Check if product exists
      const product = await this.productRepository.findOne({
        where: { id: productId }
      });
      
      if (!product) {
        this.logger.error(`Product not found with ID: ${productId}`);
        throw new NotFoundException('Product not found');
      }

      // Find the highest position to set a new image at the end
      const existingImages = await this.productImageRepository.find({
        where: { product_id: productId },
        order: { position: 'ASC' }
      });
      
      let newPosition = 0;
      if (existingImages.length > 0) {
        // If images exist, place new one at the end
        newPosition = Math.max(...existingImages.map(img => img.position)) + 1;
      }
      
      // Create new image entity with only the fields that exist in the database
      const image = new ProductImage();
      
      // Set the primary URL field (the actual database column)
      image.url = imageData.originalUrl;
      image.product_id = productId;
      image.position = newPosition;
      image.alt = ''; // Default empty alt text
      
      // Log the image entity before saving for debugging
      this.logger.debug(`Creating product image: ${JSON.stringify({
        url: image.url,
        product_id: image.product_id,
        position: image.position,
        alt: image.alt
      })}`);
      
      // Save image with error handling
      try {
        const savedImage = await this.productImageRepository.save(image);
        this.logger.debug(`Successfully saved image for product ${productId}: ${JSON.stringify(savedImage)}`);
      } catch (error) {
        this.logger.error(`Error saving product image to database: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error)}`);
        this.logger.error(`Image data: ${JSON.stringify(image)}`);
        throw new InternalServerErrorException(`Failed to save product image: ${error.message}`);
      }

      // Clear cache
      await this.invalidateCache(productId);
    } catch (error) {
      this.logger.error(`Error in addProductImage: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Remove an image from a product
   * @param productId Product ID
   * @param imageId Image ID
   */
  async removeProductImage(productId: string, imageId: string): Promise<void> {
    try {
      // Check if product exists first
      const product = await this.productRepository.findOne({
        where: { id: productId }
      });
      
      if (!product) {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }

      // Check if image exists and belongs to this product
      const image = await this.productImageRepository.findOne({
        where: { id: imageId, product_id: productId }
      });

      if (!image) {
        throw new NotFoundException(`Image with ID "${imageId}" not found for product "${productId}"`);
      }

      this.logger.debug(`Deleting image ${imageId} from product ${productId}`);
      
      // Use entityManager to delete the image
      try {
        const result = await this.entityManager.delete('product_images', imageId);
        
        if (result.affected === 0) {
          throw new NotFoundException(`Failed to delete image ${imageId}`);
        }
        
        this.logger.debug(`Successfully deleted image ${imageId} from product ${productId}`);
      } catch (error) {
        this.logger.error(`Error deleting image from database: ${error.message}`);
        throw new InternalServerErrorException(`Failed to delete product image: ${error.message}`);
      }

      // Clear cache
      await this.invalidateCache(productId);
    } catch (error) {
      this.logger.error(`Error removing product image: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
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
   * Load relations for a product
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
        const rawImages = await this.productImageRepository.find({
          where: { product_id: product.id }
        });
        
        this.logger.debug(`Found ${rawImages.length} images for product ${product.id}`);
        
        // Log the raw image data for debugging
        if (rawImages.length > 0) {
          this.logger.debug(`First image details: ${JSON.stringify(rawImages[0])}`);
        }
        
        // Explicitly map the image properties to ensure they're serialized correctly
        // Create plain objects to avoid serialization issues with class instances
        product.images = rawImages.map(img => {
          const mappedImage = {
            id: img.id,
            product_id: img.product_id,
            url: img.url,
            original_url: img.url, // Set both URL fields explicitly
            thumbnail_url: img.url,
            alt: img.alt,
            position: img.position,
            created_at: img.created_at,
            updated_at: img.updated_at
          };
          
          // Log each mapped image for debugging
          this.logger.debug(`Mapped image ID ${img.id}: url=${img.url}, original_url=${mappedImage.original_url}`);
          
          return mappedImage;
        }) as unknown as ProductImage[];
        
        const imageTime = Date.now() - imageStartTime;
        this.logger.debug(`Loaded ${product.images.length} images for product ${product.id} in ${imageTime}ms`);
        this.logger.debug(`Image URLs: ${product.images.map(img => img.url).join(', ')}`);
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
   * Load related data for multiple products
   */
  private async loadProductsRelations(products: Product[]): Promise<void> {
    if (!products.length) return;

    const productIds = products.map(p => p.id);
    this.logger.debug(`Loading relations for ${productIds.length} products: ${productIds.join(', ')}`);

    // Load images in batches to avoid overwhelming the database
    try {
      const imageStartTime = Date.now();
      const allImages = await this.productImageRepository.find({
        where: { product_id: In(productIds) }
      });

      this.logger.debug(`Found ${allImages.length} total images for ${productIds.length} products`);

      // Group images by product_id
      const imagesByProductId: Record<string, ProductImage[]> = allImages.reduce((acc: Record<string, ProductImage[]>, img: ProductImage) => {
        if (!acc[img.product_id]) {
          acc[img.product_id] = [];
        }
        acc[img.product_id].push(img);
        return acc;
      }, {});

      // Map images to products with explicit property mapping
      products.forEach(product => {
        const productImages = imagesByProductId[product.id] || [];
        
        // Map the images to ensure they have both url and original_url/thumbnail_url
        product.images = productImages.map((img: ProductImage) => {
          return {
            id: img.id,
            product_id: img.product_id,
            url: img.url,
            original_url: img.url, // Set both URL fields explicitly
            thumbnail_url: img.url,
            alt: img.alt,
            position: img.position,
            created_at: img.created_at,
            updated_at: img.updated_at
          };
        }) as unknown as ProductImage[];
        
        if (product.images.length > 0) {
          this.logger.debug(`Product ${product.id} has ${product.images.length} images. First image URL: ${product.images[0].url}`);
        } else {
          this.logger.debug(`Product ${product.id} has no images`);
        }
      });

      const imageTime = Date.now() - imageStartTime;
      this.logger.debug(`Loaded images for ${productIds.length} products in ${imageTime}ms`);
    } catch (imageError) {
      this.logger.error(`Failed to load images for products: ${imageError.message}`);
      // Set empty images arrays for graceful degradation
      products.forEach(p => {
        p.images = [];
      });
    }
    
    // We need to restore the rest of the loadProductsRelations method
    // Load variants for all products
    try {
      const variants = await this.variantRepository.find({
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
      
      // Assign variants and categories to each product
      // (images were already assigned above)
      products.forEach(product => {
        product.variants = variants.filter(v => v.product_id === product.id);
        product.categories = categoriesMap.get(product.id) || [];
      });
      
      this.logger.debug(`Successfully loaded relations for ${products.length} products`);
    } catch (error: any) {
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
