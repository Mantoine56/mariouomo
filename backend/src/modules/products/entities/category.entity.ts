import { Entity, Column, Tree, TreeChildren, TreeParent, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

/**
 * Category entity representing product categories in a hierarchical tree structure.
 * Each category can have multiple child categories and products.
 * Categories are organized in a tree structure for efficient navigation and management.
 */
@Entity('categories')
@Tree('closure-table')
export class Category extends BaseEntity {
  /**
   * Category name, displayed in the UI and used for navigation
   */
  @ApiProperty({ description: 'Category name' })
  @Column()
  name: string;

  /**
   * URL-friendly version of the category name
   * Used for SEO-friendly URLs and routing
   */
  @ApiProperty({ description: 'URL-friendly slug' })
  @Column({ unique: true })
  slug: string;

  /**
   * Detailed description of the category
   * Used in category pages and meta descriptions
   */
  @ApiProperty({ description: 'Category description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * URL of the category image
   * Used for category thumbnails and banners
   */
  @ApiProperty({ description: 'Category image URL' })
  @Column({ nullable: true })
  imageUrl?: string;

  /**
   * Position of the category in the list
   * Used for custom ordering of categories
   */
  @ApiProperty({ description: 'Display position' })
  @Column({ default: 0 })
  position: number;

  /**
   * Controls whether the category is visible in the UI
   * Used to temporarily hide categories without deleting them
   */
  @ApiProperty({ description: 'Category visibility' })
  @Column({ default: true })
  isVisible: boolean;

  /**
   * SEO metadata for the category page
   * Used to optimize category pages for search engines
   */
  @ApiProperty({ description: 'SEO metadata' })
  @Column('jsonb', { nullable: true })
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  /**
   * Full path of the category in the tree
   * Example: "Clothing > Men's > Shirts"
   */
  @ApiProperty({ description: 'Category path in tree' })
  path: string;

  /**
   * Child categories of this category
   * Forms the hierarchical tree structure
   */
  @ApiProperty({ description: 'Child categories', type: () => [Category] })
  @TreeChildren()
  children: Category[];

  /**
   * Parent category of this category
   * null for root categories
   */
  @ApiProperty({ description: 'Parent category', type: () => Category })
  @TreeParent()
  parent: Category;

  /**
   * Products associated with this category
   * Many-to-many relationship with Product entity
   */
  @ApiProperty({ description: 'Products in this category', type: () => [Product] })
  @ManyToMany(() => Product, product => product.categories)
  products: Product[];

  /**
   * Number of child categories
   * Used for UI display and optimization
   */
  @ApiProperty({ description: 'Number of child categories' })
  @Column({ default: 0 })
  childCount: number;

  /**
   * Total number of products in this category and its subcategories
   * Used for UI display and filtering
   */
  @ApiProperty({ description: 'Total number of products' })
  @Column({ default: 0 })
  totalProducts: number;
}
