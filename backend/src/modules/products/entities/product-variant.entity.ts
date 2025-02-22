import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';

/**
 * ProductVariant entity representing different versions of a product
 * (e.g., different sizes, colors, etc.)
 */
@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @ApiProperty({ description: 'Reference to the parent product' })
  @Column({ type: 'uuid' })
  product_id: string;

  @ApiProperty({ description: 'SKU (Stock Keeping Unit)' })
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @ApiProperty({ description: 'Variant name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Price adjustment from base product price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_adjustment: number;

  @ApiProperty({ description: 'Variant-specific attributes in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @ApiProperty({ description: 'Weight in grams' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @ApiProperty({ description: 'Dimensions in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  // Relationships
  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => InventoryItem, inventory => inventory.variant)
  inventory_items: InventoryItem[];
}
