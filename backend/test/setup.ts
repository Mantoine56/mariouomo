import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { TestDbUtils } from './utils/test-db-utils';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Singleton DataSource for tests
let dataSource: DataSource | null = null;

/**
 * Get the test database connection
 * Creates a singleton connection to be reused across tests
 */
export async function getTestDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  // Create a new DataSource if none exists
  dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    schema: process.env.DATABASE_SCHEMA || 'public',
    synchronize: false,
    logging: process.env.LOG_LEVEL === 'debug',
    entities: [resolve(__dirname, '../src/**/*.entity{.ts,.js}')],
    migrations: [resolve(__dirname, '../src/migrations/*{.ts,.js}')],
  });

  await dataSource.initialize();
  
  return dataSource;
}

/**
 * Setup the test database
 * This should be called in the global beforeAll hook
 */
export async function setupTestDatabase(): Promise<void> {
  const conn = await getTestDataSource();
  
  // First clean the database
  await TestDbUtils.cleanDatabase(conn);
  
  // Then seed with minimal test data
  await TestDbUtils.seedDatabase(conn);
}

/**
 * Clean the test database
 * This should be called in the global afterAll hook
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await TestDbUtils.cleanDatabase(dataSource);
    await dataSource.destroy();
    dataSource = null;
  }
}

/**
 * Reset the test database between tests
 * This should be called in beforeEach or afterEach hooks
 */
export async function resetTestDatabase(): Promise<void> {
  const conn = await getTestDataSource();
  await TestDbUtils.cleanDatabase(conn);
}

/**
 * Global setup function for Jest
 */
export async function globalSetup(): Promise<void> {
  await setupTestDatabase();
}

/**
 * Global teardown function for Jest
 */
export async function globalTeardown(): Promise<void> {
  await cleanupTestDatabase();
} 