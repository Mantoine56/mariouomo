import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import * as newrelic from 'newrelic';
import { monitorPoolMetrics } from '../../config/database.config';

/**
 * Interface for database pool
 */
interface DatabasePool {
  totalCount: number;
  activeCount: number;
  on(event: string, handler: (error: Error) => void): void;
  drain(): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Service for managing database connections and transactions
 * Implements connection pooling and monitoring
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly isProduction: boolean;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  /**
   * Get the database pool
   */
  private get pool(): DatabasePool | null {
    try {
      const pool = (this.dataSource.driver as any)?.pool;
      if (!pool) {
        this.logger.warn('Database pool is not available');
        return null;
      }
      return pool;
    } catch (error) {
      this.logger.warn('Failed to access database pool', error);
      return null;
    }
  }

  /**
   * Initialize database monitoring
   */
  async onModuleInit() {
    this.logger.log('Initializing database service...');

    const pool = this.pool;
    if (!pool) {
      this.logger.warn('Skipping pool monitoring setup - pool not available');
      return;
    }

    // Start monitoring pool metrics
    this.monitoringInterval = monitorPoolMetrics(pool);

    // Set up pool error handling
    if (typeof pool.on === 'function') {
      pool.on('error', (err: Error) => {
        this.handlePoolError(err);
      });
    } else {
      this.logger.warn('Pool event binding not available, skipping error handler setup');
    }

    this.logger.log('Database service initialized');
  }

  /**
   * Clean up resources when module is destroyed
   */
  async onModuleDestroy() {
    this.logger.log('Cleaning up database service...');
    
    // Clear monitoring interval
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Close all connections in the pool
    try {
      const pool = this.pool;
      if (pool && typeof pool.drain === 'function' && typeof pool.clear === 'function') {
        await pool.drain();
        await pool.clear();
        this.logger.log('Database connections closed');
      } else {
        this.logger.log('No pool to drain or clear method not available');
      }
    } catch (error) {
      this.logger.error('Error closing database connections:', error);
    }
  }

  /**
   * Get a query runner for transaction management
   * @returns QueryRunner instance
   */
  async getQueryRunner(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return queryRunner;
  }

  /**
   * Execute a function within a transaction
   * @param operation - Function to execute within transaction
   * @returns Result of the operation
   */
  async withTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = await this.getQueryRunner();
    const startTime = Date.now();

    try {
      await queryRunner.startTransaction();
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      
      // Record transaction metrics in production
      if (this.isProduction) {
        const duration = Date.now() - startTime;
        newrelic.recordMetric('Database/Transaction/Duration', duration);
      }

      return result;
    } catch (error) {
      this.handleTransactionError(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Handle pool errors and record metrics
   * @param error The error that occurred
   */
  private handlePoolError(error: Error): void {
    this.logger.error('Database pool error:', error);
    newrelic.noticeError(error, {
      poolTotal: this.pool?.totalCount || 0,
      poolActive: this.pool?.activeCount || 0,
    });
  }

  /**
   * Handle transaction errors and record metrics
   * @param error The error that occurred
   */
  private handleTransactionError(error: Error): void {
    this.logger.error('Transaction failed:', error);
    newrelic.noticeError(error);
  }
}
