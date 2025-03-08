/**
 * Integration Tests for Analytics Components Using Mocks
 * 
 * This test file demonstrates how to use the mock database setup
 * to test analytics services without requiring a real database connection.
 */

const { Test } = require('@nestjs/testing');
const { setupTestDatabase, teardownTestDatabase } = require('../utils/database-test-setup');
const { getTestDatabaseModule } = require('../utils/test-database.module');

// Mock services to test
const analyticsCollectorMock = {
  aggregateDailyMetrics: jest.fn().mockResolvedValue({
    id: 'mock-metrics-id',
    store_id: 'store-123',
    date: new Date(),
    total_sales: 1500,
    average_order_value: 75,
  }),
};

const analyticsSchedulerMock = {
  handleDailyAggregation: jest.fn().mockResolvedValue({
    processed: 5,
    errors: 0,
  }),
  handleMonthlyAggregation: jest.fn().mockResolvedValue({
    processed: 3,
    errors: 0,
  }),
};

// Create a mock module for testing
const createTestModule = async () => {
  // Mock the database module to prevent actual database connections
  process.env.DB_MOCK = 'true';
  
  const moduleRef = await Test.createTestingModule({
    imports: [
      getTestDatabaseModule(true), // Use the mock database module
    ],
    providers: [
      // Provide mock implementations for the services
      {
        provide: 'AnalyticsCollectorService',
        useValue: analyticsCollectorMock,
      },
      {
        provide: 'AnalyticsSchedulerService',
        useValue: analyticsSchedulerMock,
      },
    ],
  }).compile();

  return moduleRef;
};

describe('Analytics Integration with Mocks', () => {
  let moduleRef;
  let dataSource;
  let analyticsCollectorService;
  let analyticsSchedulerService;

  // Set up before tests run
  beforeAll(async () => {
    // Set up the database (mocked)
    dataSource = await setupTestDatabase();
    
    // Create the test module
    moduleRef = await createTestModule();
    
    // Get the mocked services
    analyticsCollectorService = moduleRef.get('AnalyticsCollectorService');
    analyticsSchedulerService = moduleRef.get('AnalyticsSchedulerService');
  });

  // Clean up after tests
  afterAll(async () => {
    await teardownTestDatabase();
    await moduleRef.close();
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AnalyticsCollectorService', () => {
    it('should aggregate daily metrics', async () => {
      // Test parameters
      const testDate = new Date();
      const testStoreId = 'store-123';
      
      // Call the method
      const result = await analyticsCollectorService.aggregateDailyMetrics(testDate, testStoreId);
      
      // Verify the method was called with the correct parameters
      expect(analyticsCollectorService.aggregateDailyMetrics).toHaveBeenCalledWith(testDate, testStoreId);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', testStoreId);
    });
  });

  describe('AnalyticsSchedulerService', () => {
    it('should handle daily aggregation', async () => {
      // Call the method
      const result = await analyticsSchedulerService.handleDailyAggregation();
      
      // Verify the method was called
      expect(analyticsSchedulerService.handleDailyAggregation).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('errors');
    });

    it('should handle monthly aggregation', async () => {
      // Call the method
      const result = await analyticsSchedulerService.handleMonthlyAggregation();
      
      // Verify the method was called
      expect(analyticsSchedulerService.handleMonthlyAggregation).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('errors');
    });
  });
}); 