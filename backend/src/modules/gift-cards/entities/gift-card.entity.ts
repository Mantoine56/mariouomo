import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from '../../users/entities/profile.entity';

/**
 * Enum for gift card status
 * Tracks the current state of the gift card
 */
export enum GiftCardStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * GiftCard entity for managing store credit and gift cards
 * Handles balance tracking and redemption
 */
@Entity('gift_cards')
export class GiftCard extends BaseEntity {
  @ApiProperty({ description: 'Unique code for the gift card' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Initial balance of the gift card' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initial_balance: number;

  @ApiProperty({ description: 'Current balance of the gift card' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  current_balance: number;

  @ApiProperty({ description: 'Gift card status', enum: GiftCardStatus })
  @Column({
    type: 'varchar',
    length: 20,
    enum: GiftCardStatus,
    default: GiftCardStatus.ACTIVE
  })
  status: GiftCardStatus;

  @ApiProperty({ description: 'Expiration date of the gift card' })
  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date;

  @ApiProperty({ description: 'Date when the gift card was redeemed' })
  @Column({ type: 'timestamptz', nullable: true })
  redeemed_at?: Date;

  @ApiProperty({ description: 'ID of the user who purchased the gift card' })
  @Column({ type: 'uuid', nullable: true })
  purchaser_id?: string;

  @ApiProperty({ description: 'ID of the user who received the gift card' })
  @Column({ type: 'uuid', nullable: true })
  recipient_id?: string;

  @ApiProperty({ description: 'Recipient email for digital gift cards' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  recipient_email?: string;

  @ApiProperty({ description: 'Personal message from purchaser' })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @ApiProperty({ description: 'Transaction history' })
  @Column({ type: 'jsonb', nullable: true })
  transaction_history?: Array<{
    timestamp: string;
    amount: number;
    type: 'redemption' | 'refund';
    order_id?: string;
    balance_after: number;
  }>;

  @ApiProperty({ description: 'Additional gift card metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'purchaser_id' })
  purchaser: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'recipient_id' })
  recipient: Profile;
}
