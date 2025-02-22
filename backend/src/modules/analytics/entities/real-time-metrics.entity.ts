import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity for tracking real-time metrics
 * Provides instant insights into current platform activity
 */
@Entity('real_time_metrics')
export class RealTimeMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'integer' })
  active_users: number;

  @Column({ type: 'integer' })
  active_sessions: number;

  @Column({ type: 'integer' })
  cart_count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cart_value: number;

  @Column({ type: 'integer' })
  pending_orders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pending_revenue: number;

  @Column({ type: 'jsonb', nullable: true })
  current_popular_products: {
    product_id: string;
    views: number;
    in_cart: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  traffic_sources: {
    source: string;
    active_users: number;
    conversion_rate: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  page_views: {
    page: string;
    views: number;
    average_time: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
