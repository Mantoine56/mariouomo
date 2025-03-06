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
   * @param productId Product ID
   * @param imageId Image ID to set as primary
   */
  async setPrimaryImage(
    productId: string,
    imageId: string,
  ): Promise<void> {
    // Reset all images to non-primary
    await this.update(
      { product_id: productId },
      { is_primary: false },
    );

    // Set new primary image
    await this.update(imageId, { is_primary: true });
  }
}
