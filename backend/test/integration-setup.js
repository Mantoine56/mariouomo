/**
 * Setup file that runs before each integration test file
 * Applies test environment configuration and sets up necessary mocks
 */

// Set test environment variables manually instead of using the TypeScript module
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/test_db';
process.env.DATABASE_SCHEMA = 'public';
process.env.DATABASE_SSL = 'false';
process.env.REDIS_ENABLED = 'false';
process.env.JWT_SECRET = 'test-jwt-secret';

// Log info about the test environment
console.log('Integration test environment initialized');
console.log(`Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
console.log(`Redis: ${process.env.REDIS_ENABLED === 'false' ? 'Disabled (using mock)' : 'Enabled'}`);

// Global setup for all integration tests
beforeAll(async () => {
  console.log('Running global beforeAll for integration tests');
  
  // Add any global initialization here
  jest.setTimeout(30000); // 30 second timeout for all tests
});

// Global teardown for all integration tests
afterAll(async () => {
  console.log('Running global afterAll for integration tests');
  
  // Add any global cleanup here
}); 