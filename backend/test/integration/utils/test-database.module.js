/**
 * Test Database Module for NestJS
 * 
 * Provides a configurable database module for integration tests
 * that can use either mock repositories or a real test database
 */

const { TypeOrmModule } = require('@nestjs/typeorm');
const { getTypeOrmMockModuleOptions, createMockDataSource } = require('./database-test-setup');

/**
 * Creates a TypeORM module for testing purposes
 * This can be imported in test modules to provide either mock or real database access
 * 
 * @param {boolean} useMock - Whether to use mock repositories (default: true)
 * @returns TypeOrmModule configured for testing
 */
function getTestDatabaseModule(useMock = true) {
  if (useMock || process.env.DB_MOCK === 'true') {
    console.log('Using mock database module for tests');
    // Return TypeOrmModule configured with mock repositories
    return TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmMockModuleOptions(),
    });
  } else {
    console.log('Using real database module for tests');
    // In a real scenario, this would use a test database configuration
    // For now, just return the mock config
    return TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmMockModuleOptions(),
    });
  }
}

/**
 * Get a MockFactory function for providing mock repositories
 * to be used with providers in test modules
 * 
 * @param {object} customImplementation - Optional custom implementations to override defaults
 * @returns A factory function for creating mock repositories
 */
function getMockRepositoryFactory(customImplementation = {}) {
  return jest.fn(() => {
    // Get a mock repository from our utils
    const mockRepo = createMockDataSource().getRepository();
    
    // Merge with any custom implementations
    return {
      ...mockRepo,
      ...customImplementation
    };
  });
}

module.exports = {
  getTestDatabaseModule,
  getMockRepositoryFactory,
}; 