import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

/**
 * Test database utilities
 * 
 * Provides functions for managing the test database, including:
 * - Getting a list of all tables to truncate
 * - Cleaning up the database between tests
 * - Seeding test data
 */
export class TestDbUtils {
  private static tableCreated = false;
  
  /**
   * Get a list of all application tables in the test database
   * 
   * @returns Array of table names to be used in tests
   */
  static getTestTables(): string[] {
    return [
      'addresses',
      'cart_items',
      'categories',
      'categories_closure',
      'customer_metrics',
      'discounts',
      'events',
      'gift_cards',
      'inventory_items',
      'inventory_metrics',
      'order_discounts',
      'order_items',
      'orders',
      'payments',
      'product_categories',
      'product_images',
      'product_variants',
      'products',
      'profiles',
      'rate_limits',
      'real_time_metrics',
      'refunds',
      'sales_metrics',
      'sessions',
      'shipments',
      'shopping_carts',
      'stores',
      'user_addresses'
    ];
  }

  /**
   * Clear all data from the test database
   * 
   * @param dataSource - TypeORM DataSource
   */
  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    if (!dataSource || !dataSource.isInitialized) {
      throw new Error('Database connection not initialized');
    }

    // Disable foreign key checks temporarily
    await dataSource.query('SET session_replication_role = "replica";');

    try {
      // Truncate all tables in reverse order to handle foreign key dependencies
      const tables = this.getTestTables().reverse();
      
      for (const table of tables) {
        try {
          await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        } catch (error) {
          console.warn(`Could not truncate table ${table}: ${error.message}`);
          // Continue with other tables even if one fails
        }
      }
    } finally {
      // Re-enable foreign key checks
      await dataSource.query('SET session_replication_role = "origin";');
    }
  }

  /**
   * Seed the test database with minimal required data
   * 
   * @param dataSource - TypeORM DataSource
   */
  static async seedDatabase(dataSource: DataSource): Promise<void> {
    if (!dataSource || !dataSource.isInitialized) {
      throw new Error('Database connection not initialized');
    }

    // Seed stores (usually needed for many tests)
    await dataSource.query(`
      INSERT INTO stores (id, name, status, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'Test Store 1', 'active', NOW(), NOW()),
        (gen_random_uuid(), 'Test Store 2', 'active', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // Seed categories
    const categoryId1 = await this.seedCategory(dataSource, 'Test Category 1', 'test-category-1', null);
    const categoryId2 = await this.seedCategory(dataSource, 'Test Category 2', 'test-category-2', categoryId1);
    
    // Seed a test product
    await this.seedProduct(dataSource, 'Test Product', 'test-product', categoryId1);
  }

  /**
   * Helper to seed a category and return its ID
   */
  private static async seedCategory(
    dataSource: DataSource, 
    name: string, 
    slug: string, 
    parentId: string | null
  ): Promise<string> {
    // Create the category
    const result = await dataSource.query(`
      INSERT INTO categories (name, slug, parent_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET name = $1
      RETURNING id;
    `, [name, slug, parentId]);

    const categoryId = result[0]?.id;
    
    // Add category closure for self-reference
    if (categoryId) {
      await dataSource.query(`
        INSERT INTO categories_closure (id_ancestor, id_descendant, depth)
        VALUES ($1, $1, 0)
        ON CONFLICT DO NOTHING;
      `, [categoryId]);
      
      // If it has a parent, add parent-child relationship
      if (parentId) {
        // First get all ancestors of the parent
        const ancestorRows = await dataSource.query(`
          SELECT id_ancestor, depth FROM categories_closure
          WHERE id_descendant = $1;
        `, [parentId]);
        
        // Add each ancestor-descendant relationship
        for (const row of ancestorRows) {
          await dataSource.query(`
            INSERT INTO categories_closure (id_ancestor, id_descendant, depth)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING;
          `, [row.id_ancestor, categoryId, row.depth + 1]);
        }
      }
    }
    
    return categoryId;
  }

  /**
   * Helper to seed a product and return its ID
   */
  private static async seedProduct(
    dataSource: DataSource, 
    name: string, 
    slug: string, 
    categoryId: string
  ): Promise<string> {
    // Create the product
    const result = await dataSource.query(`
      INSERT INTO products (
        name, slug, description, active, price, sale_price,
        sku, stock, created_at, updated_at
      )
      VALUES (
        $1, $2, 'Test product description', TRUE, 
        99.99, 79.99, 'TEST-SKU-001', 100, NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET name = $1
      RETURNING id;
    `, [name, slug]);

    const productId = result[0]?.id;
    
    // Add product-category relationship
    if (productId && categoryId) {
      await dataSource.query(`
        INSERT INTO product_categories (product_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [productId, categoryId]);
    }
    
    return productId;
  }

  /**
   * Setup test tables and database structure
   * This should be run before tests to ensure proper structure
   * 
   * @param dataSource TypeORM DataSource instance
   */
  static async setupTestTables(dataSource: DataSource): Promise<void> {
    // Skip if tables are already created
    if (this.tableCreated) {
      return;
    }

    // We'll rely on TypeORM synchronize for now
    // In a production app, you would run actual migrations here
    this.tableCreated = true;
  }

  /**
   * Reset the database to a clean state
   * This can be called between tests to ensure isolation
   * 
   * @param dataSource TypeORM DataSource instance
   */
  static async resetDatabase(dataSource: DataSource): Promise<void> {
    await this.cleanDatabase(dataSource);
  }
} 