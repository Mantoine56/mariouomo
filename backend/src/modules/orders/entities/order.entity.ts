import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from '../../users/entities/profile.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

/**
 * Enum for order status
 * Helps maintain consistency and type safety for order states
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * Order entity representing customer orders
 * Manages the entire lifecycle of an order from creation to fulfillment
 */
@Entity('orders')
export class Order extends BaseEntity {
  @ApiProperty({ description: 'Reference to the user who placed the order' })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  @Column({
    type: 'varchar',
    length: 20,
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({ description: 'Total order amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @ApiProperty({ description: 'Subtotal before tax and shipping' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @ApiProperty({ description: 'Shipping amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping: number;

  @ApiProperty({ description: 'Shipping address details' })
  @Column({ type: 'jsonb' })
  shipping_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    additional_details?: string;
  };

  @ApiProperty({ description: 'Billing address details' })
  @Column({ type: 'jsonb' })
  billing_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    additional_details?: string;
  };

  @ApiProperty({ description: 'Customer notes for the order' })
  @Column({ type: 'text', nullable: true })
  customer_notes?: string;

  @ApiProperty({ description: 'Internal notes for staff' })
  @Column({ type: 'text', nullable: true })
  staff_notes?: string;

  @ApiProperty({ description: 'Additional order metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Profile, profile => profile.orders)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @OneToMany(() => Shipment, shipment => shipment.order)
  shipments: Shipment[];
}
