import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';

/**
 * Enum for discount types
 * Defines how the discount amount is applied
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_SHIPPING = 'free_shipping'
}

/**
 * Discount entity for managing promotional offers
 * Handles various types of discounts and their application rules
 */
@Entity('discounts')
export class Discount extends BaseEntity {
  @ApiProperty({ description: 'Name of the discount' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Description of the discount' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Discount code for manual application' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Type of discount', enum: DiscountType })
  @Column({
    type: 'varchar',
    length: 20,
    enum: DiscountType
  })
  type: DiscountType;

  @ApiProperty({ description: 'Value of the discount (percentage or fixed amount)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Minimum purchase amount required' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimum_purchase?: number;

  @ApiProperty({ description: 'Maximum discount amount allowed' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximum_discount?: number;

  @ApiProperty({ description: 'Start date of the discount' })
  @Column({ type: 'timestamptz' })
  starts_at: Date;

  @ApiProperty({ description: 'End date of the discount' })
  @Column({ type: 'timestamptz', nullable: true })
  ends_at?: Date;

  @ApiProperty({ description: 'Maximum number of times this discount can be used' })
  @Column({ type: 'integer', nullable: true })
  usage_limit?: number;

  @ApiProperty({ description: 'Number of times this discount has been used' })
  @Column({ type: 'integer', default: 0 })
  times_used: number;

  @ApiProperty({ description: 'Whether the discount is currently active' })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Additional rules and conditions' })
  @Column({ type: 'jsonb', nullable: true })
  rules?: {
    customer_eligibility?: {
      new_customers_only?: boolean;
      minimum_previous_orders?: number;
      specific_customer_groups?: string[];
    };
    product_requirements?: {
      minimum_items?: number;
      specific_categories?: string[];
      excluded_products?: string[];
    };
    usage_restrictions?: {
      once_per_customer?: boolean;
      combinable_with_other_discounts?: boolean;
    };
  };

  // Relationships
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'discount_products',
    joinColumn: { name: 'discount_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' }
  })
  applicable_products: Product[];

  @ManyToMany(() => Store)
  @JoinTable({
    name: 'discount_stores',
    joinColumn: { name: 'discount_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'store_id', referencedColumnName: 'id' }
  })
  applicable_stores: Store[];
}
