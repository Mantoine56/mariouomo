import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as newrelic from 'newrelic';

/**
 * Database connection pool configuration interface
 */
export interface PoolConfig {
  readonly min: number;
  readonly max: number;
  readonly idleTimeoutMillis: number;
  readonly acquireTimeoutMillis: number;
  readonly reapIntervalMillis: number;
}

/**
 * Get environment-specific pool configuration
 * @param configService - NestJS ConfigService
 * @returns Pool configuration based on environment
 */
export const getPoolConfig = (configService: ConfigService): PoolConfig => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  return {
    min: configService.get('DB_POOL_MIN') || (isProduction ? 2 : 1),
    max: configService.get('DB_POOL_MAX') || (isProduction ? 10 : 5),
    idleTimeoutMillis: configService.get('DB_POOL_IDLE_TIMEOUT') || 30000,
    acquireTimeoutMillis: configService.get('DB_POOL_ACQUIRE_TIMEOUT') || 60000,
    reapIntervalMillis: configService.get('DB_POOL_REAP_INTERVAL') || 1000,
  };
};

/**
 * Get TypeORM database configuration with connection pooling
 * @param configService - NestJS ConfigService
 * @returns TypeORM configuration options
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const poolConfig = getPoolConfig(configService);
  const isProduction = configService.get('NODE_ENV') === 'production';
  const dbUrl = configService.get('DATABASE_URL');

  // If DATABASE_URL is provided, use it instead of individual connection parameters
  if (dbUrl) {
    // Check if connecting to Supabase
    const isSupabase = dbUrl.includes('.supabase.co');
    
    return {
      type: 'postgres',
      url: dbUrl,
      entities: ['dist/**/*.entity{.ts,.js}'],
      // Disable synchronize when connecting to Supabase or in production
      synchronize: !isSupabase && !isProduction,
      
      // Always enable SSL for Supabase connections, otherwise use production setting
      ssl: isSupabase ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false),

      // Connection pool configuration
      extra: {
        // Pool configuration
        min: poolConfig.min,
        max: poolConfig.max,
        idleTimeoutMillis: poolConfig.idleTimeoutMillis,
        acquireTimeoutMillis: poolConfig.acquireTimeoutMillis,
        reapIntervalMillis: poolConfig.reapIntervalMillis,
        
        // Statement timeout (30 seconds)
        statement_timeout: 30000,
      },

      // Pool events for monitoring
      poolErrorHandler: (err: Error) => {
        newrelic.noticeError(err);
        console.error('Database pool error:', err);
      },

      // Logging configuration (development only)
      logging: !isProduction ? ['error', 'warn', 'schema'] : false,
      maxQueryExecutionTime: !isProduction ? 1000 : undefined, // Log slow queries (>1s) in development
    };
  }

  // Fallback to individual connection parameters
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: !isProduction, // Only enable in development
    ssl: isProduction ? { rejectUnauthorized: false } : false,

    // Connection pool configuration
    extra: {
      // Pool configuration
      min: poolConfig.min,
      max: poolConfig.max,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis,
      acquireTimeoutMillis: poolConfig.acquireTimeoutMillis,
      reapIntervalMillis: poolConfig.reapIntervalMillis,
      
      // Statement timeout (30 seconds)
      statement_timeout: 30000,
    },

    // Pool events for monitoring
    poolErrorHandler: (err: Error) => {
      newrelic.noticeError(err);
      console.error('Database pool error:', err);
    },

    // Logging configuration (development only)
    logging: !isProduction ? ['error', 'warn', 'schema'] : false,
    maxQueryExecutionTime: !isProduction ? 1000 : undefined, // Log slow queries (>1s) in development
  };
};

/**
 * Monitor database pool metrics
 * @param pool - Database connection pool
 * @returns Monitoring interval handle
 */
export const monitorPoolMetrics = (pool: any): NodeJS.Timeout => {
  const MONITORING_INTERVAL = 60000; // 1 minute

  return setInterval(() => {
    const metrics = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      active: pool.activeCount,
    };

    // Record metrics in New Relic
    newrelic.recordMetric('db.pool.total', metrics.total);
    newrelic.recordMetric('db.pool.idle', metrics.idle);
    newrelic.recordMetric('db.pool.waiting', metrics.waiting);
    newrelic.recordMetric('db.pool.active', metrics.active);

    // Log pool status
    console.debug('Database pool metrics:', metrics);
  }, MONITORING_INTERVAL);
};
