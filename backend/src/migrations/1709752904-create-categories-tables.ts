import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create the categories and related tables
 * This implements the hierarchical tree structure for product categories
 */
export class CreateCategoriesTables1709752904 implements MigrationInterface {
  /**
   * Run the migration - create tables and indexes
   * @param queryRunner QueryRunner instance
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(255),
        position INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        seo_metadata JSONB,
        child_count INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Create closure table for hierarchical tree structure
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories_closure (
        id SERIAL PRIMARY KEY,
        ancestor_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        descendant_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        depth INTEGER NOT NULL
      );
    `);

    // Create product_categories junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, category_id)
      );
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_closure_ancestor ON categories_closure(ancestor_id);
      CREATE INDEX IF NOT EXISTS idx_categories_closure_descendant ON categories_closure(descendant_id);
      CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
    `);

    // Add sample data for testing
    await queryRunner.query(`
      INSERT INTO categories (name, slug, description, position, is_visible)
      VALUES 
        ('Men', 'men', 'Men''s clothing and accessories', 1, true),
        ('Women', 'women', 'Women''s clothing and accessories', 2, true),
        ('Accessories', 'accessories', 'Fashion accessories for all', 3, true);
    `);
  }

  /**
   * Revert the migration - drop tables
   * @param queryRunner QueryRunner instance
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation
    await queryRunner.query(`DROP TABLE IF EXISTS product_categories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories_closure;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories;`);
  }
}
