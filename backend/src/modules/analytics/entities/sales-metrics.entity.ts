import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity for tracking sales-related metrics
 * Stores aggregated data for sales analysis
 */
@Entity('sales_metrics')
export class SalesMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_revenue: number;

  @Column({ type: 'integer' })
  total_orders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  average_order_value: number;

  @Column({ type: 'integer' })
  total_units_sold: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  conversion_rate: number;

  @Column({ type: 'jsonb', nullable: true })
  top_products: {
    product_id: string;
    units_sold: number;
    revenue: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  sales_by_category: {
    category_id: string;
    revenue: number;
    units_sold: number;
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
   * Product ID for direct joins
   * Enables efficient product-specific analytics
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  product_id: string;

  /**
   * Category ID for direct joins
   * Enables efficient category-specific analytics
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  category_id: string;

  /**
   * Views count for conversion rate calculations
   * Helps track product page views for accurate conversion metrics
   */
  @Column({ type: 'integer', default: 0 })
  views: number;
}
