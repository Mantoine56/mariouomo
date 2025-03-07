import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

/**
 * Get TypeORM database configuration specifically for testing
 * This extends the main database configuration with test-specific settings
 * 
 * @param configService - NestJS ConfigService
 * @returns TypeORM configuration options for testing
 */
export const getTestDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // Start with the base database configuration
  const baseConfig = getDatabaseConfig(configService);
  
  // Get test-specific settings
  const tablePrefix = configService.get<string>('DATABASE_TABLE_PREFIX', 'test_');
  const syncSchema = configService.get<boolean>('DATABASE_SYNC_SCHEMA', false);
  
  // Override settings for testing
  return {
    ...baseConfig,
    // Use table prefix for test tables
    entityPrefix: tablePrefix,
    // Drop schema each time in test environment for clean tests
    synchronize: syncSchema,
    // Don't log queries in tests by default
    logging: configService.get<string>('LOG_LEVEL') === 'debug' ? ['error', 'warn', 'schema'] as any : false,
    // Disable connection keepalive
    autoLoadEntities: true,
    // Don't retry connections as much in tests
    retryAttempts: configService.get<number>('DATABASE_RETRY_ATTEMPTS', 3),
    retryDelay: configService.get<number>('DATABASE_RETRY_DELAY', 1000),
    // Additional test settings
    migrationsRun: false,
    // Optimize for test environment
    extra: {
      ...(baseConfig.extra as Record<string, any>),
      // Use smaller pool for tests
      min: configService.get<number>('DB_POOL_MIN', 1),
      max: configService.get<number>('DB_POOL_MAX', 5),
      idleTimeoutMillis: configService.get<number>('DB_POOL_IDLE_TIMEOUT', 10000),
      acquireTimeoutMillis: configService.get<number>('DB_POOL_ACQUIRE_TIMEOUT', 30000),
      // Shorter statement timeout for tests
      statement_timeout: 15000, // 15 seconds
    },
  };
}; 