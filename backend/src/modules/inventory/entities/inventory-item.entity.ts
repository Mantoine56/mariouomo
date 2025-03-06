import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

/**
 * InventoryItem entity for tracking product stock levels
 * Uses optimistic locking for concurrent inventory updates
 * 
 * Note: This entity includes both old and new field names for compatibility
 * during the database migration process.
 */
@Entity('inventory_items')
@Index(['variant_id', 'location'])
export class InventoryItem extends BaseEntity {
  @ApiProperty({ description: 'Reference to the product variant' })
  @Column({ type: 'uuid' })
  variant_id: string;

  @ApiProperty({ description: 'Stock location/warehouse' })
  @Column({ type: 'varchar', length: 100 })
  location: string;

  @ApiProperty({ description: 'Current quantity in stock' })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({ description: 'Reserved quantity (for pending orders)' })
  @Column({ type: 'integer', default: 0 })
  reserved_quantity: number;
  
  @ApiProperty({ description: 'Reserved quantity (legacy field)' })
  @Column({ type: 'integer', default: 0, name: 'reserved' })
  reserved?: number;

  @ApiProperty({ description: 'Minimum stock level before reorder' })
  @Column({ type: 'integer', default: 0 })
  reorder_point: number;

  @ApiProperty({ description: 'Target stock level when reordering' })
  @Column({ type: 'integer', default: 0 })
  reorder_quantity: number;

  @ApiProperty({ description: 'Version number for optimistic locking' })
  @Column({ type: 'integer', default: 1 })
  version: number;

  @ApiProperty({ description: 'Last inventory count date' })
  @Column({ type: 'timestamptz', nullable: true })
  last_counted_at?: Date;

  @ApiProperty({ description: 'Additional inventory metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => ProductVariant, variant => variant.inventory_items)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
