// Import Jest globals from @jest/globals
import { beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase, resetTestDatabase } from './setup';

// Global setup before all tests run
beforeAll(async () => {
  // Set up the test database with clean state and seed data
  await setupTestDatabase();
}, 30000); // Extend timeout for database setup

// Reset the database between tests
afterEach(async () => {
  // Clean the database after each test
  await resetTestDatabase();
}, 10000); // Extend timeout for database reset

// Global cleanup after all tests
afterAll(async () => {
  // Clean up and disconnect from test database
  await cleanupTestDatabase();
}, 30000); // Extend timeout for database cleanup

// Set test environment timeout higher for database operations
jest.setTimeout(30000);

// Variables to store original console methods
let originalConsoleLog: typeof console.log;
let originalConsoleWarn: typeof console.warn;
let originalConsoleError: typeof console.error;

// Save original console methods before tests
beforeAll(() => {
  originalConsoleLog = console.log;
  originalConsoleWarn = console.warn;
  originalConsoleError = console.error;
  
  // If running in CI, suppress console output to keep test output clean
  if (process.env.CI) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

// Restore console methods after all tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}); 