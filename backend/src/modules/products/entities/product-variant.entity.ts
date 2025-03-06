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

  /**
   * SKU (Stock Keeping Unit) - unique identifier for this variant
   */
  @ApiProperty({ description: 'SKU (Stock Keeping Unit)' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string;

  /**
   * Name of the variant
   */
  @ApiProperty({ description: 'Name of the variant' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Barcode for the variant (UPC, EAN, etc.)
   */
  @ApiProperty({ description: 'Barcode (UPC, EAN, etc.)' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @ApiProperty({ description: 'Price adjustment from base product price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_adjustment: number;

  /**
   * Option values for this variant (color, size, etc.)
   * Stored as a JSONB object
   */
  @ApiProperty({ description: 'Option values for this variant (color, size, etc.)' })
  @Column({ type: 'jsonb', nullable: true })
  option_values?: Record<string, any>;

  /**
   * Position for ordering variants
   */
  @ApiProperty({ description: 'Position for ordering variants' })
  @Column({ type: 'integer', nullable: true })
  position?: number;

  // Relationships
  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => InventoryItem, inventory => inventory.variant)
  inventory_items: InventoryItem[];
}
