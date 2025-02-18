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
  private monitoringInterval: NodeJS.Timeout;

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
  private get pool(): DatabasePool {
    return (this.dataSource.driver as any).pool;
  }

  /**
   * Initialize database monitoring
   */
  async onModuleInit() {
    this.logger.log('Initializing database service...');

    // Start monitoring pool metrics
    this.monitoringInterval = monitorPoolMetrics(this.pool);

    // Set up pool error handling
    this.pool.on('error', (err: Error) => {
      this.handlePoolError(err);
    });

    this.logger.log('Database service initialized');
  }

  /**
   * Clean up resources when module is destroyed
   */
  async onModuleDestroy() {
    this.logger.log('Cleaning up database service...');
    
    // Clear monitoring interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Close all connections in the pool
    try {
      await this.pool.drain();
      await this.pool.clear();
      this.logger.log('Database connections closed');
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
      
      this.recordTransactionMetrics('commit', startTime);
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.recordTransactionMetrics('rollback', startTime);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Handle pool errors
   * @param error - Error from the connection pool
   */
  private handlePoolError(error: Error) {
    this.logger.error('Database pool error:', error);
    newrelic.noticeError(error, {
      poolTotal: this.pool.totalCount,
      poolActive: this.pool.activeCount,
    });

    if (this.isProduction) {
      // In production, attempt to recover from pool errors
      this.attemptPoolRecovery();
    }
  }

  /**
   * Attempt to recover from pool errors
   */
  private async attemptPoolRecovery() {
    try {
      // Close idle connections
      await this.pool.drain();
      
      // Wait for active queries to finish (max 30 seconds)
      await Promise.race([
        this.pool.clear(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pool recovery timeout')), 30000)
        ),
      ]);

      this.logger.log('Successfully recovered database pool');
    } catch (error) {
      this.logger.error('Failed to recover database pool:', error);
      newrelic.noticeError(error);
    }
  }

  /**
   * Record transaction metrics
   * @param type - Type of transaction (commit/rollback)
   * @param startTime - Start time of the transaction
   */
  private recordTransactionMetrics(type: 'commit' | 'rollback', startTime: number) {
    const duration = Date.now() - startTime;
    
    newrelic.recordMetric(`db.transaction.${type}`, 1);
    newrelic.recordMetric('db.transaction.duration', duration);
    
    if (type === 'rollback') {
      newrelic.incrementMetric('db.transaction.rollbacks');
    }

    this.logger.debug(`Transaction ${type} completed in ${duration}ms`);
  }
}
