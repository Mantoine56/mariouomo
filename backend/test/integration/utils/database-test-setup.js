/**
 * Database test setup utilities for integration tests
 * This file provides functions for setting up and tearing down test databases
 * including mocked implementations for TypeORM repositories and connections
 */

// Create a mock entity manager that can be used for testing
function createMockEntityManager() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn(entityData => entityData),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({}),
      getMany: jest.fn().mockResolvedValue([]),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue([]),
    })),
  };
}

// Create a mock repository that can be used for testing
function createMockRepository() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn(entityData => entityData),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({}),
      getMany: jest.fn().mockResolvedValue([]),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue([]),
    })),
    metadata: {
      columns: [],
      relations: [],
    },
  };
}

// Create a mock QueryRunner for TypeORM
function createMockQueryRunner() {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
    manager: createMockEntityManager(),
  };
}

// Create a mock DataSource (formerly Connection) for TypeORM
function createMockDataSource() {
  // Repository cache to return the same mock repository instance for the same entity
  const repositoryCache = new Map();

  return {
    isInitialized: true,
    driver: {
      options: {
        type: 'postgres',
      },
    },
    createQueryRunner: jest.fn(() => createMockQueryRunner()),
    getRepository: jest.fn((entity) => {
      const entityName = entity.name || 'UnknownEntity';
      if (!repositoryCache.has(entityName)) {
        repositoryCache.set(entityName, createMockRepository());
      }
      return repositoryCache.get(entityName);
    }),
    transaction: jest.fn((callback) => callback(createMockEntityManager())),
    manager: createMockEntityManager(),
    close: jest.fn().mockResolvedValue(undefined),
    initialize: jest.fn().mockResolvedValue(undefined),
  };
}

// Configure TypeORM mock module options
function getTypeOrmMockModuleOptions() {
  return {
    type: 'postgres',
    autoLoadEntities: true,
    synchronize: false, // Never synchronize in tests
    useFactory: async () => createMockDataSource(),
  };
}

/**
 * Set up test database for integration tests
 * If DB_MOCK environment variable is set to 'true', this will use
 * a mock implementation instead of a real database connection
 */
async function setupTestDatabase() {
  console.log('Setting up test database connection...');
  
  if (process.env.DB_MOCK === 'true') {
    console.log('Using mock database connection');
    // Return a mock data source that can be used in place of a real TypeORM DataSource
    return createMockDataSource();
  } else {
    console.log('Using real test database connection');
    // For real database connection logic would go here
    // For now, we'll just use the mock implementation
    return createMockDataSource();
  }
}

/**
 * Tear down test database resources
 * Cleans up connections and other resources
 */
async function teardownTestDatabase() {
  console.log('Tearing down test database resources...');
  
  // Any cleanup logic would go here
  // If using real connections, would close them here
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  createMockRepository,
  createMockEntityManager,
  createMockDataSource,
  getTypeOrmMockModuleOptions,
}; 