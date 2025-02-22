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
}
