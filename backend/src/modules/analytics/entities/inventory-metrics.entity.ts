import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity for tracking inventory-related metrics
 * Monitors stock levels, turnover, and inventory health
 */
@Entity('inventory_metrics')
export class InventoryMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  turnover_rate: number;

  @Column({ type: 'integer' })
  total_sku_count: number;

  @Column({ type: 'integer' })
  low_stock_items: number;

  @Column({ type: 'integer' })
  out_of_stock_items: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  inventory_value: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  dead_stock_percentage: number;

  @Column({ type: 'jsonb', nullable: true })
  stock_by_location: {
    location: string;
    total_items: number;
    total_value: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  category_metrics: {
    category_id: string;
    turnover_rate: number;
    stock_value: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
