/**
 * Test Module Factory for NestJS Integration Tests
 * 
 * Provides utilities for creating NestJS test modules with mocked
 * database and Redis dependencies.
 */

const { Test } = require('@nestjs/testing');
const { getTestDatabaseModule } = require('./test-database.module');
const { getRedisMockProviders } = require('./redis-mock.module');

/**
 * Creates a test module with common mock providers
 * 
 * @param {Object} options Configuration options
 * @param {Array} options.imports Additional modules to import
 * @param {Array} options.providers Additional providers to include
 * @param {Array} options.controllers Controllers to include
 * @param {boolean} options.mockDatabase Whether to mock the database (default: true)
 * @param {boolean} options.mockRedis Whether to mock Redis (default: true)
 * @returns {Promise<import('@nestjs/testing').TestingModule>} Compiled testing module
 */
async function createTestingModule(options = {}) {
  const {
    imports = [],
    providers = [],
    controllers = [],
    mockDatabase = true,
    mockRedis = true,
  } = options;

  // Set environment variables for mock mode
  if (mockDatabase) {
    process.env.DB_MOCK = 'true';
  }

  // Create module setup
  const moduleBuilder = Test.createTestingModule({
    imports: [
      ...(mockDatabase ? [getTestDatabaseModule(true)] : []),
      ...imports,
    ],
    controllers,
    providers: [
      ...(mockRedis ? getRedisMockProviders() : []),
      ...providers,
    ],
  });

  // Override dependencies if needed
  if (options.overrides) {
    for (const override of options.overrides) {
      moduleBuilder.overrideProvider(override.token).useValue(override.value);
    }
  }

  // Compile and return the module
  return moduleBuilder.compile();
}

/**
 * Initialize test with mocked dependencies
 * 
 * @param {Object} options Configuration options
 * @returns {Promise<Object>} Module and service references
 */
async function initializeTestWithMocks(options = {}) {
  const module = await createTestingModule(options);
  
  const result = { module };
  
  // Get requested services
  if (options.services) {
    for (const [key, service] of Object.entries(options.services)) {
      try {
        result[key] = module.get(service);
      } catch (error) {
        console.warn(`Could not resolve service ${service}:`, error.message);
      }
    }
  }
  
  return result;
}

module.exports = {
  createTestingModule,
  initializeTestWithMocks,
}; 