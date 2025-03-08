/**
 * TypeORM Mock for Tests
 * 
 * This file mocks TypeORM to prevent actual database connections in tests.
 * It provides mock implementations for commonly used TypeORM functionality.
 */

// Mock entity manager
const mockEntityManager = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({}),
  save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// Mock query builder
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue({}),
  getMany: jest.fn().mockResolvedValue([]),
  getRawOne: jest.fn().mockResolvedValue({}),
  getRawMany: jest.fn().mockResolvedValue([]),
  execute: jest.fn().mockResolvedValue({}),
};

// Mock repository
const mockRepository = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({}),
  save: jest.fn(entity => Promise.resolve({ id: 'mock-id', ...entity })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  manager: mockEntityManager,
  metadata: {
    columns: [],
    relations: [],
  },
};

// Mock data source (formerly Connection)
class MockDataSource {
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
      manager: mockEntityManager,
    };
  }
  
  getRepository() {
    return mockRepository;
  }
  
  transaction(callback) {
    return callback(mockEntityManager);
  }
}

// Get the actual TypeORM module
const actualTypeorm = jest.requireActual('typeorm');

// Export the mock module
module.exports = {
  ...actualTypeorm,
  DataSource: MockDataSource,
  EntityManager: mockEntityManager.constructor,
  Repository: mockRepository.constructor,
  // Additional TypeORM exports if needed
}; 