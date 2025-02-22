import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * Enum for shipment status
 * Tracks the state of shipment from creation to delivery
 */
export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}

/**
 * Shipment entity for tracking order deliveries
 * Manages shipping information and delivery status
 */
@Entity('shipments')
export class Shipment extends BaseEntity {
  @ApiProperty({ description: 'Reference to the order' })
  @Column({ type: 'uuid' })
  order_id: string;

  @ApiProperty({ description: 'Shipping provider (e.g., FedEx, UPS)' })
  @Column({ type: 'varchar', length: 50 })
  shipping_provider: string;

  @ApiProperty({ description: 'Tracking number' })
  @Column({ type: 'varchar', length: 100 })
  tracking_number: string;

  @ApiProperty({ description: 'Shipment status', enum: ShipmentStatus })
  @Column({
    type: 'varchar',
    length: 20,
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING
  })
  status: ShipmentStatus;

  @ApiProperty({ description: 'Estimated delivery date' })
  @Column({ type: 'timestamptz', nullable: true })
  estimated_delivery_date?: Date;

  @ApiProperty({ description: 'Actual delivery date' })
  @Column({ type: 'timestamptz', nullable: true })
  delivered_at?: Date;

  @ApiProperty({ description: 'Shipping label URL' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  label_url?: string;

  @ApiProperty({ description: 'Package dimensions and weight' })
  @Column({ type: 'jsonb', nullable: true })
  package_details?: {
    weight: number;
    weight_unit: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };

  @ApiProperty({ description: 'Tracking history' })
  @Column({ type: 'jsonb', nullable: true })
  tracking_history?: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;

  @ApiProperty({ description: 'Additional shipment metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Order, order => order.shipments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
