import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { ProductImage } from '../entities/product-image.entity';

/**
 * Repository for ProductImage entity
 * Handles image-specific database operations
 */
@Injectable()
export class ProductImageRepository extends BaseRepository<ProductImage> {
  constructor(entityManager: EntityManager) {
    super(ProductImage, entityManager);
  }
  /**
   * Find all images for a product
   * @param productId Product ID
   * @returns Array of product images
   */
  async findByProductId(productId: string): Promise<ProductImage[]> {
    return this.find({
      where: { product_id: productId },
      order: { position: 'ASC' },
    });
  }

  /**
   * Update image positions for a product
   * @param productId Product ID
   * @param imageIds Ordered array of image IDs
   */
  async updatePositions(
    productId: string,
    imageIds: string[],
  ): Promise<void> {
    await Promise.all(
      imageIds.map((id, index) =>
        this.update(id, {
          position: index,
        }),
      ),
    );
  }

  /**
   * Set primary image for a product
   * Note: We use position = 0 for the primary image instead of a separate is_primary field
   * @param productId Product ID
   * @param imageId Image ID to set as primary
   */
  async setPrimaryImage(
    productId: string,
    imageId: string,
  ): Promise<void> {
    // Get all images for this product
    const images = await this.findByProductId(productId);
    
    // Skip if no images or image not found
    if (!images.length || !images.some(img => img.id === imageId)) {
      return;
    }
    
    // Get the current position of the primary image
    const primaryImagePosition = images.find(img => img.id === imageId)?.position || 0;
    
    // If the image is already at position 0, no need to do anything
    if (primaryImagePosition === 0) {
      return;
    }
    
    // Set the current position 0 image to the position of the selected image
    const currentPrimaryImage = images.find(img => img.position === 0);
    if (currentPrimaryImage) {
      await this.update(currentPrimaryImage.id, { position: primaryImagePosition });
    }
    
    // Set the selected image as position 0 (primary)
    await this.update(imageId, { position: 0 });
  }
}
