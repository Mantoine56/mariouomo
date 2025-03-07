import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

/**
 * Prefix used for test tables
 * This helps isolate test data from development/production data
 */
export const TEST_TABLE_PREFIX = process.env.DATABASE_TABLE_PREFIX || 'test_';

/**
 * Utility functions for managing test database
 */
export class TestDbUtils {
  private static tableCreated = false;
  
  /**
   * Get list of all test tables that might need to be cleaned up
   * This list should be kept in sync with the actual tables used in tests
   * 
   * @returns List of test table names
   */
  static getTestTables(): string[] {
    return [
      'sales_metrics',
      'inventory_metrics',
      'customer_metrics',
      'real_time_metrics',
      'orders',
      'order_items',
      'products',
      'product_variants',
      'product_images',
      'inventory_items',
      'profiles',
      'shopping_carts',
      'cart_items',
      'stores',
    ].map(table => `${TEST_TABLE_PREFIX}${table}`);
  }

  /**
   * Clean up test tables in the database
   * This should be run after tests to ensure a clean state
   * 
   * @param dataSource TypeORM DataSource instance
   */
  static async cleanupTestTables(dataSource: DataSource): Promise<void> {
    if (!dataSource.isInitialized) {
      throw new Error('DataSource not initialized');
    }

    // Get all test tables
    const tables = this.getTestTables();
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      // Start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // Truncate each test table
      for (const table of tables) {
        try {
          // First check if the table exists
          const tableExists = await queryRunner.query(
            `SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            )`,
            [table]
          );
          
          if (tableExists[0].exists) {
            // Use TRUNCATE to efficiently remove all rows
            await queryRunner.query(`TRUNCATE TABLE "${table}" CASCADE`);
            console.log(`✓ Truncated test table: ${table}`);
          }
        } catch (err) {
          console.warn(`Warning: Could not truncate table ${table}: ${err.message}`);
        }
      }
      
      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (err) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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
    await this.cleanupTestTables(dataSource);
  }
} 