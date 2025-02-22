import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

/**
 * OrderItem entity representing individual items within an order
 * Tracks quantity, pricing, and links to the specific product variant
 */
@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ApiProperty({ description: 'Reference to the parent order' })
  @Column({ type: 'uuid' })
  order_id: string;

  @ApiProperty({ description: 'Reference to the product variant' })
  @Column({ type: 'uuid' })
  variant_id: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({ description: 'Unit price at time of order' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @ApiProperty({ description: 'Subtotal for this item (quantity * unit_price)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: 'Product name at time of order' })
  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @ApiProperty({ description: 'Variant name at time of order' })
  @Column({ type: 'varchar', length: 255 })
  variant_name: string;

  @ApiProperty({ description: 'Product metadata at time of order' })
  @Column({ type: 'jsonb', nullable: true })
  product_metadata?: {
    sku: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    [key: string]: any;
  };

  // Relationships
  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
