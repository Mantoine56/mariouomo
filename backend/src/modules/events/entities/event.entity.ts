import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from '../../users/entities/profile.entity';

/**
 * Enum for event types
 * Categorizes different types of system events
 */
export enum EventType {
  ORDER = 'order',
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  INVENTORY = 'inventory',
  USER = 'user',
  SECURITY = 'security',
  SYSTEM = 'system'
}

/**
 * Enum for event severity levels
 * Indicates the importance and urgency of events
 */
export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Event entity for system-wide event logging
 * Tracks important system events, actions, and changes
 */
@Entity('events')
export class Event extends BaseEntity {
  @ApiProperty({ description: 'Type of event', enum: EventType })
  @Column({
    type: 'varchar',
    length: 20,
    enum: EventType
  })
  type: EventType;

  @ApiProperty({ description: 'Event severity level', enum: EventSeverity })
  @Column({
    type: 'varchar',
    length: 20,
    enum: EventSeverity,
    default: EventSeverity.INFO
  })
  severity: EventSeverity;

  @ApiProperty({ description: 'Brief description of the event' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'ID of the user who triggered the event' })
  @Column({ type: 'uuid', nullable: true })
  triggered_by?: string;

  @ApiProperty({ description: 'IP address where the event originated' })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @ApiProperty({ description: 'User agent information' })
  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @ApiProperty({ description: 'Related entity type (e.g., "order", "product")' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  entity_type?: string;

  @ApiProperty({ description: 'ID of the related entity' })
  @Column({ type: 'uuid', nullable: true })
  entity_id?: string;

  @ApiProperty({ description: 'Changes made during the event' })
  @Column({ type: 'jsonb', nullable: true })
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };

  @ApiProperty({ description: 'Additional event metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Error details if applicable' })
  @Column({ type: 'jsonb', nullable: true })
  error_details?: {
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
  };

  // Relationships
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'triggered_by' })
  user: Profile;
}
