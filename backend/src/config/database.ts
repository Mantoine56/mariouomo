import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';

/**
 * Configures the database connection options based on environment
 * @param configService The NestJS ConfigService to access environment variables
 * @returns TypeORM database connection options
 */
export const databaseConfig = (configService: ConfigService, logger?: LoggerService) => {
  const dbUrl = configService.get<string>('DATABASE_URL');
  const dbSchema = configService.get<string>('DATABASE_SCHEMA', 'public');
  const retryAttempts = configService.get<number>('DATABASE_RETRY_ATTEMPTS', 5);
  const retryDelay = configService.get<number>('DATABASE_RETRY_DELAY', 3000);

  if (!dbUrl) {
    throw new Error('Database URL is required but was not provided');
  }

  // Log database connection info (excluding sensitive data)
  if (logger) {
    logger.log?.('Connecting to database...');
    logger.debug?.(`Using schema: ${dbSchema}`);
    logger.debug?.(`Retry configuration: ${retryAttempts} attempts with ${retryDelay}ms delay`);
  }

  // The main database configuration
  return {
    url: dbUrl,
    schema: dbSchema,
    ssl: process.env.NODE_ENV === 'production',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.DATABASE_LOGGING === 'true',
    // Improved retry logic
    retryAttempts,
    retryDelay,
    keepConnectionAlive: true,
    // Set a longer connection timeout
    connectTimeoutMS: 30000,
    // Handle connection errors
    extra: {
      connectionLimit: 10,
      idleTimeoutMillis: 30000,
      // PostgreSQL specific options
      max: 20, // Maximum pool size
      min: 2,  // Minimum pool size
    },
  };
}; 