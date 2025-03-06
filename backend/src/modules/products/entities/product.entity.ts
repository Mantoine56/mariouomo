import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Store } from '../../stores/entities/store.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { Category } from './category.entity';

/**
 * Product entity representing items that can be sold in the store
 * Each product can have multiple variants and images
 */
@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({ description: 'Reference to the store' })
  @Column({ type: 'uuid' })
  store_id: string;

  @ApiProperty({ description: 'Product name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Product description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Product status (active/draft/archived)' })
  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'draft'
  })
  status: string;

  @ApiProperty({ description: 'Product type' })
  @Column({ type: 'varchar', length: 50 })
  type: string;

  /**
   * Legacy category field - will be deprecated in favor of the categories relation
   * Kept for backward compatibility during migration
   */
  @ApiProperty({ description: 'Legacy product category (deprecated)' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @ApiProperty({ description: 'Base price of the product' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @ApiProperty({ description: 'Product tags' })
  @Column({ type: 'varchar', array: true, nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'SEO metadata in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  seo_metadata?: Record<string, any>;

  @ApiProperty({ description: 'Additional product attributes in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => ProductVariant, variant => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, image => image.product)
  images: ProductImage[];

  /**
   * Categories this product belongs to
   * Many-to-many relationship with Category entity
   * This replaces the legacy 'category' string field
   */
  @ApiProperty({ description: 'Product categories', type: () => [Category] })
  @ManyToMany(() => Category, (category: Category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}
