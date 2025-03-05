import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { Product } from '../entities/product.entity';
import { CreateVariantDto, UpdateVariantDto } from '../dtos/variant.dto';
import { CacheService } from '@common/cache/cache.service';

/**
 * Service for managing product variants
 * Handles variant CRUD operations and inventory tracking
 */
@Injectable()
export class VariantService {
  private readonly logger = new Logger(VariantService.name);

  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new product variant
   * @param createVariantDto Variant creation data
   * @returns Created variant
   */
  async createVariant(createVariantDto: CreateVariantDto): Promise<ProductVariant> {
    const { productId, ...variantData } = createVariantDto;

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if SKU is unique
    const existingVariant = await this.variantRepository.findOne({
      where: { sku: variantData.sku },
    });
    if (existingVariant) {
      throw new BadRequestException('SKU already exists');
    }

    try {
      // Create variant
      const variant = this.variantRepository.create({
        ...variantData,
        product,
      });

      const savedVariant = await this.variantRepository.save(variant);

      // Invalidate cache
      await this.cacheService.del(`product:${productId}`);

      return savedVariant;
    } catch (error) {
      this.logger.error(`Error creating variant: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create variant');
    }
  }

  /**
   * Update an existing variant
   * @param id Variant ID
   * @param updateVariantDto Update data
   * @returns Updated variant
   */
  async updateVariant(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check SKU uniqueness if changed
    if (updateVariantDto.sku !== variant.sku) {
      const existingVariant = await this.variantRepository.findOne({
        where: { sku: updateVariantDto.sku },
      });
      if (existingVariant) {
        throw new BadRequestException('SKU already exists');
      }
    }

    try {
      // Update variant
      Object.assign(variant, updateVariantDto);
      const updatedVariant = await this.variantRepository.save(variant);

      // Invalidate cache
      await this.cacheService.del(`product:${variant.product.id}`);

      return updatedVariant;
    } catch (error) {
      this.logger.error(`Error updating variant: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update variant');
    }
  }

  /**
   * Delete a variant
   * @param id Variant ID
   */
  async deleteVariant(id: string): Promise<void> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    try {
      await this.variantRepository.remove(variant);

      // Invalidate cache
      await this.cacheService.del(`product:${variant.product.id}`);
    } catch (error) {
      this.logger.error(`Error deleting variant: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete variant');
    }
  }

  /**
   * Update variant inventory
   * @param id Variant ID
   * @param quantity New quantity
   */
  async updateInventory(id: string, quantity: number): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    try {
      variant.quantity = quantity;
      const updatedVariant = await this.variantRepository.save(variant);

      // Invalidate cache
      await this.cacheService.del(`product:${variant.product.id}`);

      // Check low stock threshold
      if (quantity <= variant.lowStockThreshold) {
        this.logger.warn(`Low stock alert for variant ${variant.sku}: ${quantity} items remaining`);
        // TODO: Implement low stock notification system
      }

      return updatedVariant;
    } catch (error) {
      this.logger.error(`Error updating inventory: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update inventory');
    }
  }

  /**
   * Get variant by ID
   * @param id Variant ID
   * @returns Variant with product data
   */
  async getVariantById(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return variant;
  }

  /**
   * Get all variants for a product
   * @param productId Product ID
   * @returns Array of variants
   */
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return this.variantRepository.find({
      where: { product: { id: productId } },
      order: { created_at: 'ASC' },
    });
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
