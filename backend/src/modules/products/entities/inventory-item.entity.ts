import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductVariant } from './product-variant.entity';

/**
 * InventoryItem entity representing inventory tracking for product variants
 * Tracks stock levels, location, and status for each variant
 */
@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @ApiProperty({ description: 'Reference to the product variant' })
  @Column({ type: 'uuid' })
  variant_id: string;

  @ApiProperty({ description: 'Current stock quantity' })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({ description: 'Location or warehouse identifier' })
  @Column({ type: 'varchar', length: 100 })
  location: string;

  @ApiProperty({ description: 'Status of the inventory item (in_stock, low_stock, out_of_stock)' })
  @Column({ type: 'varchar', length: 20, default: 'in_stock' })
  status: string;

  @ApiProperty({ description: 'Minimum stock level before reorder' })
  @Column({ type: 'integer' })
  reorder_point: number;

  @ApiProperty({ description: 'Additional metadata in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => ProductVariant, variant => variant.inventory_items)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
