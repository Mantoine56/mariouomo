import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity for tracking customer behavior and engagement metrics
 * Helps analyze customer patterns and loyalty
 */
@Entity('customer_metrics')
export class CustomerMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'integer' })
  new_customers: number;

  @Column({ type: 'integer' })
  returning_customers: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  customer_lifetime_value: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  retention_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  churn_rate: number;

  @Column({ type: 'jsonb', nullable: true })
  purchase_frequency: {
    frequency: string; // 'weekly', 'monthly', 'quarterly', 'yearly'
    customer_count: number;
    revenue: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  customer_segments: {
    segment: string;
    customer_count: number;
    total_revenue: number;
    average_order_value: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  geographic_distribution: {
    region: string;
    customer_count: number;
    revenue: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Store ID for multi-tenant support
   * Allows filtering metrics by store
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  store_id: string;

  /**
   * Traffic source tracking for attribution analysis
   * Helps identify most valuable customer acquisition channels
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  traffic_source: string;

  /**
   * Last purchase date for retention analysis
   * Enables accurate customer recency metrics
   */
  @Column({ type: 'date', nullable: true })
  @Index()
  last_purchase_date: Date;
}
