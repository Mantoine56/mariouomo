// test-environment.ts
// Setup the test environment variables for integration tests

import { DataSource } from 'typeorm';
import { jest } from '@jest/globals';

// Use relative paths to entity imports based on the actual project structure
// Import these from the modules directory if that's the correct location
import { SalesMetrics } from '../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../src/modules/analytics/entities/customer-metrics.entity';

/**
 * Test environment configuration
 * Sets up environment variables and mocks for testing
 */

/**
 * Sets up environment variables for testing
 * This ensures Redis, database, and other services have mock configurations
 */
export function setupTestEnvironment(): void {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Use the dedicated test database (according to the migration plan)
  // Replace placeholders with actual values from your test database
  process.env.DATABASE_URL = 'postgres://postgres:[PASSWORD]@db.[TEST-PROJECT-ID].supabase.co:5432/postgres';
  process.env.DATABASE_SCHEMA = 'public';
  process.env.DATABASE_SSL = 'true';
  
  // Redis configuration for tests
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.REDIS_ENABLED = 'false'; // Disable Redis for tests
  
  // AWS configuration
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
  
  // JWT configuration
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRATION = '1d';
  
  // API configuration
  process.env.API_PORT = '3000';
  process.env.API_PREFIX = 'api';
  
  // Logging configuration
  process.env.LOG_LEVEL = 'error';
  
  // Auth configuration
  process.env.AUTH_ENABLED = 'false';
  
  console.log('Test environment variables set up');
}

/**
 * Creates a mock DataSource for testing
 * This avoids the need for a real database connection during tests
 * @returns A mock DataSource with transaction support
 */
export function createMockDataSource(): DataSource {
  // Create a mock manager for transactions
  const mockEntityManager = {
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
      getMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue(null),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue([]),
    }),
  };

  // Create a mock DataSource
  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: mockEntityManager,
    }),
    getRepository: jest.fn().mockImplementation((entity) => {
      // Return specific repositories based on entity
      if (entity === SalesMetrics) {
        return {
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          createQueryBuilder: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
            getMany: jest.fn().mockResolvedValue([]),
            getRawOne: jest.fn().mockResolvedValue(null),
            getRawMany: jest.fn().mockResolvedValue([]),
          }),
        };
      } else if (entity === InventoryMetrics) {
        return {
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          createQueryBuilder: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
            getMany: jest.fn().mockResolvedValue([]),
            getRawOne: jest.fn().mockResolvedValue(null),
            getRawMany: jest.fn().mockResolvedValue([]),
          }),
        };
      } else if (entity === CustomerMetrics) {
        return {
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          createQueryBuilder: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
            getMany: jest.fn().mockResolvedValue([]),
            getRawOne: jest.fn().mockResolvedValue(null),
            getRawMany: jest.fn().mockResolvedValue([]),
          }),
        };
      }
      // Default repository
      return {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      };
    }),
    transaction: jest.fn().mockImplementation((callback: any) => {
      return callback(mockEntityManager);
    }),
    manager: mockEntityManager,
  } as unknown as DataSource;

  return mockDataSource;
} 