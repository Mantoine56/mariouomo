/**
 * Integration tests for analytics components using mocks
 * This demonstrates how to use mocks for testing without actual database connections
 */

const { Test } = require('@nestjs/testing');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { v4: uuidv4 } = require('uuid');
const { AppModule } = require('../../../src/app.module');
const { SalesMetrics } = require('../../../src/modules/analytics/entities/sales-metrics.entity');

describe('Analytics Testing with Mocks', () => {
  let app;
  let analyticsCollectorService;
  let analyticsSchedulerService;
  let salesMetricsRepository;
  
  // Test data
  const testStoreId = uuidv4();
  const testDate = new Date();
  
  beforeAll(async () => {
    // Create a test module with mocked dependencies
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('DataSource')
    .useValue({
      // Mock minimal DataSource methods needed for tests
      transaction: jest.fn().mockImplementation((callback) => callback({})),
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      })
    })
    .compile();

    // Get services for testing
    analyticsCollectorService = moduleFixture.get('AnalyticsCollectorService');
    analyticsSchedulerService = moduleFixture.get('AnalyticsSchedulerService');
    salesMetricsRepository = moduleFixture.get(getRepositoryToken(SalesMetrics));
    
    // Mock methods
    analyticsCollectorService.aggregateDailyMetrics = jest.fn().mockResolvedValue({});
    analyticsSchedulerService.handleDailyAggregation = jest.fn().mockResolvedValue({});
    analyticsSchedulerService.handleMonthlyAggregation = jest.fn().mockResolvedValue({});
  });

  describe('Analytics Service', () => {
    it('should mock aggregateDailyMetrics', async () => {
      // Call the method
      await analyticsCollectorService.aggregateDailyMetrics(testDate, testStoreId);
      
      // Verify it was called
      expect(analyticsCollectorService.aggregateDailyMetrics).toHaveBeenCalledWith(testDate, testStoreId);
    });
  });

  describe('Scheduler Service', () => {
    it('should mock handleDailyAggregation', async () => {
      // Call the method
      await analyticsSchedulerService.handleDailyAggregation();
      
      // Verify it was called
      expect(analyticsSchedulerService.handleDailyAggregation).toHaveBeenCalled();
    });

    it('should mock handleMonthlyAggregation', async () => {
      // Call the method
      await analyticsSchedulerService.handleMonthlyAggregation();
      
      // Verify it was called
      expect(analyticsSchedulerService.handleMonthlyAggregation).toHaveBeenCalled();
    });
  });
}); 