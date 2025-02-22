import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * Enum for payment status
 * Ensures consistent status values across the application
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

/**
 * Enum for payment methods
 * Standardizes supported payment methods
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  GIFT_CARD = 'gift_card'
}

/**
 * Payment entity for tracking order payments
 * Handles various payment methods and maintains payment state
 */
@Entity('payments')
export class Payment extends BaseEntity {
  @ApiProperty({ description: 'Reference to the order' })
  @Column({ type: 'uuid' })
  order_id: string;

  @ApiProperty({ description: 'Payment amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({
    type: 'varchar',
    length: 20,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Column({
    type: 'varchar',
    length: 20,
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment provider transaction ID' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id?: string;

  @ApiProperty({ description: 'Payment provider reference' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_reference?: string;

  @ApiProperty({ description: 'Error message if payment failed' })
  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @ApiProperty({ description: 'Payment provider response data' })
  @Column({ type: 'jsonb', nullable: true })
  provider_response?: Record<string, any>;

  @ApiProperty({ description: 'Additional payment metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
