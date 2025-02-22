import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

/**
 * ProductImage entity for storing product images
 * Uses Supabase Storage for actual image files
 */
@Entity('product_images')
export class ProductImage extends BaseEntity {
  @ApiProperty({ description: 'Reference to the product' })
  @Column({ type: 'uuid' })
  product_id: string;

  @ApiProperty({ description: 'Image URL in Supabase Storage' })
  @Column({ type: 'varchar', length: 255 })
  url: string;

  @ApiProperty({ description: 'Image alt text' })
  @Column({ type: 'varchar', length: 255 })
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
  };

  // Relationships
  @ManyToOne(() => Product, product => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
