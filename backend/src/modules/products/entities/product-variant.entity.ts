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
   * Derived from option_values or sku if not provided
   */
  @ApiProperty({ description: 'Name of the variant' })
  get name(): string {
    // Try to get name from option_values first
    if (this.option_values && (this.option_values as any).name) {
      return (this.option_values as any).name;
    }
    
    // Fall back to a combination of option values if available
    if (this.option_values) {
      const values = Object.values(this.option_values).filter(val => typeof val === 'string');
      if (values.length > 0) {
        return values.join(' / ');
      }
    }
    
    // Last resort: Use SKU or generic name
    return this.sku ? `Variant ${this.sku}` : 'Unnamed Variant';
  }

  // Virtual setter for name
  set name(value: string) {
    // Since name is not in the database, store it in option_values
    if (!this.option_values) {
      this.option_values = {};
    }
    
    (this.option_values as any).name = value;
  }

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
   * Current stock level for this variant
   * Virtual property derived from inventory_items or option_values
   */
  @ApiProperty({ description: 'Current stock quantity' })
  get current_stock(): number {
    // Try to get from option_values first
    if (this.option_values && typeof (this.option_values as any).stock === 'number') {
      return (this.option_values as any).stock;
    }
    
    // If we have inventory_items loaded, calculate from there
    if (this.inventory_items && Array.isArray(this.inventory_items)) {
      return this.inventory_items.reduce((total, item) => total + (item.quantity || 0), 0);
    }
    
    // Default to 0 if no data available
    return 0;
  }

  // Virtual setter for current_stock
  set current_stock(value: number) {
    // Since current_stock is not in the database, store it in option_values
    if (!this.option_values) {
      this.option_values = {};
    }
    
    (this.option_values as any).stock = value;
  }

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
