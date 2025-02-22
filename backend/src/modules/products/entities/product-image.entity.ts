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

  @ApiProperty({ description: 'Original image URL (S3/CDN)' })
  @Column({ type: 'varchar', length: 255 })
  originalUrl: string;

  @ApiProperty({ description: 'Thumbnail image URL (S3/CDN)' })
  @Column({ type: 'varchar', length: 255 })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Image alt text' })
  @Column({ type: 'varchar', length: 255, nullable: true })
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
