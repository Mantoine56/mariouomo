import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Database utility service that provides helper methods for database operations
 */
@Injectable()
export class DbUtilsService {
  private readonly logger = new Logger(DbUtilsService.name);
  private tableCache: Record<string, boolean> = {};

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Check if a table exists in the database
   * @param tableName Table name to check
   * @returns Promise that resolves to true if table exists, false otherwise
   */
  async tableExists(tableName: string): Promise<boolean> {
    // Check cache first
    if (this.tableCache[tableName] !== undefined) {
      return this.tableCache[tableName];
    }

    try {
      // Using PostgreSQL information_schema to check if table exists
      const result = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      const exists = result[0]?.exists || false;
      
      // Cache the result
      this.tableCache[tableName] = exists;
      
      return exists;
    } catch (error) {
      this.logger.error(`Error checking if table ${tableName} exists: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Execute a query only if the specified table exists
   * @param tableName Table name to check
   * @param queryFn Function that executes the query
   * @param defaultValue Default value to return if table doesn't exist
   * @returns Result of queryFn or defaultValue if table doesn't exist
   */
  async executeIfTableExists<T>(
    tableName: string, 
    queryFn: () => Promise<T>, 
    defaultValue: T
  ): Promise<T> {
    if (await this.tableExists(tableName)) {
      return queryFn();
    } else {
      this.logger.warn(`Table ${tableName} does not exist, returning default value`);
      return defaultValue;
    }
  }

  /**
   * Clear the table existence cache
   */
  clearTableCache(): void {
    this.tableCache = {};
  }
} 