import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

/**
 * ProductImage entity for storing product images
 * Supports both original and thumbnail images via S3/CDN
 */
@Entity('product_images')
export class ProductImage extends BaseEntity {
  @ApiProperty({ description: 'Reference to the product' })
  @Column({ type: 'uuid' })
  product_id: string;

  /**
   * URL of the image
   * This is the actual database column
   */
  @ApiProperty({ description: 'Image URL (S3/CDN)' })
  @Column({ type: 'text' })
  url: string;

  /**
   * Original URL - maps to 'url' database field
   * Virtual property that maps to url for frontend compatibility
   */
  @ApiProperty({ description: 'Original image URL (S3/CDN)' })
  get originalUrl(): string {
    return this.url;
  }

  set originalUrl(value: string) {
    this.url = value;
  }

  /**
   * Thumbnail URL - virtual property for frontend compatibility
   * In our current schema, we use the same URL for both
   */
  @ApiProperty({ description: 'Thumbnail image URL (S3/CDN)' })
  get thumbnailUrl(): string {
    return this.url;
  }

  set thumbnailUrl(value: string) {
    // Only set url if it's not already set
    if (!this.url) {
      this.url = value;
    }
  }

  @ApiProperty({ description: 'Image alt text' })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'alt_text' })
  alt: string;

  @ApiProperty({ description: 'Display order of the image' })
  @Column({ type: 'integer', default: 0 })
  position: number;

  @ApiProperty({ description: 'Is this the primary product image?' })
  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @ApiProperty({ description: 'Image metadata in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    contentType: string;
  };

  // Relationships
  @ManyToOne(() => Product, product => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
