import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration for test environment
 * Uses a completely separate database for testing
 */
export default registerAs('database', () => {
  return (configService: ConfigService): TypeOrmModuleOptions => {
    // Basic connection configuration
    return {
      type: 'postgres',
      url: configService.get<string>('DATABASE_URL'),
      schema: configService.get<string>('DATABASE_SCHEMA', 'public'),
      synchronize: configService.get<boolean>('DATABASE_SYNC_SCHEMA', false),
      logging: configService.get<string>('NODE_ENV') === 'development',
      
      // Retry configuration for tests
      retryAttempts: configService.get<number>('DATABASE_RETRY_ATTEMPTS', 3),
      retryDelay: configService.get<number>('DATABASE_RETRY_DELAY', 1000),
      
      // Connection pool configuration for tests
      // Use the extra field for specific postgres pool configuration
      extra: {
        min: configService.get<number>('DB_POOL_MIN', 1),
        max: configService.get<number>('DB_POOL_MAX', 5),
        idleTimeoutMillis: configService.get<number>('DB_POOL_IDLE_TIMEOUT', 10000),
        acquireTimeoutMillis: configService.get<number>('DB_POOL_ACQUIRE_TIMEOUT', 30000),
        reapIntervalMillis: configService.get<number>('DB_POOL_REAP_INTERVAL', 1000),
      },
      
      // Entity discovery configuration
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      
      // Disable migrations in tests
      migrationsRun: false,
      
      // Ensure we don't use cache for tests
      cache: false,
    };
  };
}); 