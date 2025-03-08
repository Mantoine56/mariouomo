/**
 * Jest Setup After Environment
 * 
 * This file runs after the test environment is set up but before tests are run.
 * It's a good place to set up global test configurations and mocks.
 */

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console.error to reduce noise in test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out TypeORM and NestJS connection errors in test output
  const errorMsg = args[0]?.toString() || '';
  const ignoredErrors = [
    'Unable to connect to the database',
    'Connection error',
    'connect ECONNREFUSED',
    'Connection to database failed',
    'this.postgres.Pool is not a constructor',
  ];

  // Don't print connection errors in test output
  if (ignoredErrors.some(ignored => errorMsg.includes(ignored))) {
    return;
  }

  // Pass through all other errors
  originalConsoleError(...args);
};

// Add global test utilities
global.waitFor = async (callback, { timeout = 5000, interval = 100 } = {}) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) return result;
    } catch (error) {
      // Ignore errors and try again
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Timed out after ${timeout}ms`);
};

// Auto-mock problematic modules
jest.mock('typeorm', () => {
  // Return a minimal implementation that prevents connection errors
  const actualTypeorm = jest.requireActual('typeorm');
  
  return {
    ...actualTypeorm,
    // Override DataSource to prevent actual database connections
    DataSource: class MockDataSource {
      constructor() {
        this.options = { type: 'postgres' };
        this.isInitialized = true;
      }
      initialize() {
        return Promise.resolve(this);
      }
      destroy() {
        return Promise.resolve();
      }
      createQueryRunner() {
        return {
          connect: jest.fn().mockResolvedValue(undefined),
          release: jest.fn().mockResolvedValue(undefined),
          startTransaction: jest.fn().mockResolvedValue(undefined),
          commitTransaction: jest.fn().mockResolvedValue(undefined),
          rollbackTransaction: jest.fn().mockResolvedValue(undefined),
          query: jest.fn().mockResolvedValue([]),
          manager: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
          },
        };
      }
      getRepository() {
        return {
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue({}),
          save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
          createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue({}),
            getMany: jest.fn().mockResolvedValue([]),
          })),
        };
      }
      transaction(callback) {
        return callback({
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue({}),
          save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
          update: jest.fn().mockResolvedValue({ affected: 1 }),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
        });
      }
    }
  };
}); 