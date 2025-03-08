import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as newrelic from 'newrelic';
import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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
 * Production database configuration
 */
export default registerAs('database', () => {
  return (configService: ConfigService): TypeOrmModuleOptions => {
    const poolConfig = getPoolConfig(configService);
    const isProduction = configService.get('NODE_ENV') === 'production';
    const dbUrl = configService.get('DATABASE_URL');
    
    // Connection retry configuration
    const retryAttempts = configService.get<number>('DATABASE_RETRY_ATTEMPTS', 5);
    const retryDelay = configService.get<number>('DATABASE_RETRY_DELAY', 3000); // ms
    
    // Common configuration options with TypeORM-specific types
    const commonConfig = {
      retryAttempts,
      retryDelay,
      keepConnectionAlive: true,
      autoLoadEntities: true,
      // Logging configuration (development only)
      logging: !isProduction ? ['error', 'warn', 'schema'] as any : false,
      maxQueryExecutionTime: !isProduction ? 1000 : undefined,
    };

    // Pool events for monitoring
    const poolErrorHandler = (err: Error) => {
      console.error('Database pool error:', err);
      try {
        newrelic.noticeError(err);
      } catch (nrError) {
        console.warn('Failed to report pool error to New Relic:', nrError);
      }
    };

    // If DATABASE_URL is provided, use it instead of individual connection parameters
    if (dbUrl) {
      // Check if connecting to Supabase
      const isSupabase = dbUrl.includes('.supabase.co');
      
      return {
        type: 'postgres' as const,
        url: dbUrl,
        schema: configService.get<string>('DATABASE_SCHEMA', 'public'),
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
          
          // Improved error handling for network issues
          connectionTimeoutMillis: 30000,
        },
        
        // Pool event handlers
        poolErrorHandler,
        
        // Add common configuration
        ...commonConfig,
      } as PostgresConnectionOptions;
    }

    // Fallback to individual connection parameters
    return {
      type: 'postgres' as const,
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
      schema: configService.get<string>('DATABASE_SCHEMA', 'public'),
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
        
        // Improved error handling for network issues
        connectionTimeoutMillis: 30000,
      },
      
      // Pool event handlers
      poolErrorHandler,
      
      // Add common configuration
      ...commonConfig,
    } as PostgresConnectionOptions;
  };
});

/**
 * Monitor database pool metrics
 * @param pool - Database connection pool
 * @returns Monitoring interval handle or null if pool is not available
 */
export const monitorPoolMetrics = (pool: any): NodeJS.Timeout | null => {
  const MONITORING_INTERVAL = 60000; // 1 minute

  if (!pool) {
    console.warn('Cannot monitor pool metrics: pool is not available');
    return null;
  }

  return setInterval(() => {
    try {
      // Make sure pool is still available and has the required properties
      if (!pool || typeof pool.totalCount === 'undefined') {
        console.warn('Pool is no longer available for metrics monitoring');
        return;
      }

      const metrics = {
        total: pool.totalCount || 0,
        idle: pool.idleCount || 0,
        waiting: pool.waitingCount || 0,
        active: pool.activeCount || 0,
      };

      // Record metrics in New Relic
      newrelic.recordMetric('db.pool.total', metrics.total);
      newrelic.recordMetric('db.pool.idle', metrics.idle);
      newrelic.recordMetric('db.pool.waiting', metrics.waiting);
      newrelic.recordMetric('db.pool.active', metrics.active);

      // Log pool status
      console.debug('Database pool metrics:', metrics);
    } catch (error) {
      console.error('Error monitoring pool metrics:', error);
    }
  }, MONITORING_INTERVAL);
};

// Add this at the end of the file for backward compatibility with existing code
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return registerAs('database', () => {
    return (cs: ConfigService) => {
      // This simply calls the default export and returns its result
      // This maintains backward compatibility with code that uses getDatabaseConfig
      return registerAs('database', () => (config: ConfigService) => {
        const poolConfig = getPoolConfig(config);
        const isProduction = config.get('NODE_ENV') === 'production';
        const dbUrl = config.get('DATABASE_URL');
        
        // Connection retry configuration
        const retryAttempts = config.get<number>('DATABASE_RETRY_ATTEMPTS', 5);
        const retryDelay = config.get<number>('DATABASE_RETRY_DELAY', 3000); // ms
        
        // Common configuration options with TypeORM-specific types
        const commonConfig = {
          retryAttempts,
          retryDelay,
          keepConnectionAlive: true,
          autoLoadEntities: true,
          // Logging configuration (development only)
          logging: !isProduction ? ['error', 'warn', 'schema'] as any : false,
          maxQueryExecutionTime: !isProduction ? 1000 : undefined,
        };

        // Pool events for monitoring
        const poolErrorHandler = (err: Error) => {
          console.error('Database pool error:', err);
          try {
            newrelic.noticeError(err);
          } catch (nrError) {
            console.warn('Failed to report pool error to New Relic:', nrError);
          }
        };

        // If DATABASE_URL is provided, use it instead of individual connection parameters
        if (dbUrl) {
          // Check if connecting to Supabase
          const isSupabase = dbUrl.includes('.supabase.co');
          
          return {
            type: 'postgres' as const,
            url: dbUrl,
            schema: config.get<string>('DATABASE_SCHEMA', 'public'),
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
              
              // Improved error handling for network issues
              connectionTimeoutMillis: 30000,
            },
            
            // Pool event handlers
            poolErrorHandler,
            
            // Add common configuration
            ...commonConfig,
          } as PostgresConnectionOptions;
        }

        // Fallback to individual connection parameters
        return {
          type: 'postgres' as const,
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          schema: config.get<string>('DATABASE_SCHEMA', 'public'),
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
            
            // Improved error handling for network issues
            connectionTimeoutMillis: 30000,
          },
          
          // Pool event handlers
          poolErrorHandler,
          
          // Add common configuration
          ...commonConfig,
        } as PostgresConnectionOptions;
      })()(configService);
    };
  })()(configService);
};
