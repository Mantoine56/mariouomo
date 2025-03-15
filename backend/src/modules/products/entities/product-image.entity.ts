import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityNoSoftDelete } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

/**
 * ProductImage entity for storing product images
 * Mapped to match the exact database schema in Supabase
 * Uses BaseEntityNoSoftDelete since the table doesn't have a deleted_at column
 */
@Entity('product_images')
export class ProductImage extends BaseEntityNoSoftDelete {
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
   * Snake case version of originalUrl for frontend compatibility
   */
  @ApiProperty({ description: 'Original image URL - snake_case for frontend compatibility' })
  get original_url(): string {
    return this.url;
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

  /**
   * Snake case version of thumbnailUrl for frontend compatibility
   */
  @ApiProperty({ description: 'Thumbnail image URL - snake_case for frontend compatibility' })
  get thumbnail_url(): string {
    return this.url;
  }

  @ApiProperty({ description: 'Image alt text' })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'alt_text' })
  alt: string;

  @ApiProperty({ description: 'Display order of the image' })
  @Column({ type: 'integer', default: 0 })
  position: number;

  // Relationships
  @ManyToOne(() => Product, product => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  
  /**
   * Custom toJSON implementation to ensure correct serialization
   * This explicitly sets the original_url and thumbnail_url properties
   * to match what the frontend expects
   */
  toJSON() {
    const { product, ...baseProps } = this as any;
    
    // Create a plain object with mapped properties
    return {
      ...baseProps,
      // Explicitly set these fields to override getter behavior during serialization
      original_url: this.url,
      thumbnail_url: this.url
    };
  }
}
