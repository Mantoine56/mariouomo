/**
 * Enhanced Analytics Mock Tests
 * 
 * This test file demonstrates a more comprehensive approach to testing
 * analytics components with proper NestJS dependency injection and mocking.
 */

const { initializeTestWithMocks } = require('../utils/test-module.factory');

// Mock implementation for AnalyticsCollectorService
const analyticsCollectorMock = {
  aggregateDailyMetrics: jest.fn().mockResolvedValue({
    id: 'mock-metrics-id',
    store_id: 'store-123',
    date: new Date(),
    total_sales: 1500,
    average_order_value: 75,
  }),
  aggregateWeeklyMetrics: jest.fn().mockResolvedValue({
    id: 'mock-weekly-id',
    store_id: 'store-123',
    date: new Date(),
    total_sales: 10500,
    average_order_value: 70,
  }),
  aggregateMonthlyMetrics: jest.fn().mockResolvedValue({
    id: 'mock-monthly-id',
    store_id: 'store-123',
    date: new Date(),
    total_sales: 45000,
    average_order_value: 68,
  }),
};

// Mock implementation for AnalyticsSchedulerService
const analyticsSchedulerMock = {
  handleDailyAggregation: jest.fn().mockResolvedValue({
    processed: 5,
    errors: 0,
  }),
  handleWeeklyAggregation: jest.fn().mockResolvedValue({
    processed: 3,
    errors: 0,
  }),
  handleMonthlyAggregation: jest.fn().mockResolvedValue({
    processed: 3,
    errors: 0,
  }),
};

// Mock implementation for RealTimeTrackingService
const realTimeTrackingMock = {
  trackSaleEvent: jest.fn().mockResolvedValue({
    id: 'mock-event-id',
    store_id: 'store-123',
    event_type: 'sale',
    timestamp: new Date(),
    data: { amount: 150 },
  }),
  trackInventoryEvent: jest.fn().mockResolvedValue({
    id: 'mock-event-id',
    store_id: 'store-123',
    event_type: 'inventory',
    timestamp: new Date(),
    data: { product_id: 'prod-123', quantity: 5 },
  }),
  trackCustomerEvent: jest.fn().mockResolvedValue({
    id: 'mock-event-id',
    store_id: 'store-123',
    event_type: 'customer',
    timestamp: new Date(),
    data: { customer_id: 'cust-123', action: 'signup' },
  }),
};

describe('Enhanced Analytics Integration Tests with Mocks', () => {
  let testModule;
  let analyticsCollectorService;
  let analyticsSchedulerService;
  let realTimeTrackingService;

  // Set up the testing module before tests
  beforeAll(async () => {
    // Initialize the testing module with mocks
    const result = await initializeTestWithMocks({
      // Configure the providers to use our mocks
      providers: [
        {
          provide: 'AnalyticsCollectorService',
          useValue: analyticsCollectorMock,
        },
        {
          provide: 'AnalyticsSchedulerService',
          useValue: analyticsSchedulerMock,
        },
        {
          provide: 'RealTimeTrackingService',
          useValue: realTimeTrackingMock,
        },
      ],
      // Configure which services we want to access
      services: {
        analyticsCollectorService: 'AnalyticsCollectorService',
        analyticsSchedulerService: 'AnalyticsSchedulerService',
        realTimeTrackingService: 'RealTimeTrackingService',
      },
    });

    // Extract module and services from result
    testModule = result.module;
    analyticsCollectorService = result.analyticsCollectorService;
    analyticsSchedulerService = result.analyticsSchedulerService;
    realTimeTrackingService = result.realTimeTrackingService;
  });

  // Clean up after tests
  afterAll(async () => {
    if (testModule) {
      await testModule.close();
    }
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
      
      // Call the service method
      const result = await analyticsCollectorService.aggregateDailyMetrics(testDate, testStoreId);
      
      // Verify the service was called with correct parameters
      expect(analyticsCollectorService.aggregateDailyMetrics).toHaveBeenCalledWith(testDate, testStoreId);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', testStoreId);
      expect(result).toHaveProperty('total_sales');
      expect(result).toHaveProperty('average_order_value');
    });

    it('should aggregate weekly metrics', async () => {
      // Test parameters
      const testDate = new Date();
      const testStoreId = 'store-123';
      
      // Call the service method
      const result = await analyticsCollectorService.aggregateWeeklyMetrics(testDate, testStoreId);
      
      // Verify the service was called with correct parameters
      expect(analyticsCollectorService.aggregateWeeklyMetrics).toHaveBeenCalledWith(testDate, testStoreId);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', testStoreId);
      expect(result).toHaveProperty('total_sales');
      expect(result).toHaveProperty('average_order_value');
    });
  });

  describe('AnalyticsSchedulerService', () => {
    it('should handle daily aggregation', async () => {
      // Call the service method
      const result = await analyticsSchedulerService.handleDailyAggregation();
      
      // Verify the service was called
      expect(analyticsSchedulerService.handleDailyAggregation).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('errors');
      expect(result.processed).toBe(5);
      expect(result.errors).toBe(0);
    });

    it('should handle weekly aggregation', async () => {
      // Call the service method
      const result = await analyticsSchedulerService.handleWeeklyAggregation();
      
      // Verify the service was called
      expect(analyticsSchedulerService.handleWeeklyAggregation).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('errors');
      expect(result.processed).toBe(3);
      expect(result.errors).toBe(0);
    });
  });

  describe('RealTimeTrackingService', () => {
    it('should track sale events', async () => {
      // Test parameters
      const storeId = 'store-123';
      const saleData = { amount: 150 };
      
      // Call the service method
      const result = await realTimeTrackingService.trackSaleEvent(storeId, saleData);
      
      // Verify the service was called with correct parameters
      expect(realTimeTrackingService.trackSaleEvent).toHaveBeenCalledWith(storeId, saleData);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', storeId);
      expect(result).toHaveProperty('event_type', 'sale');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(saleData);
    });

    it('should track inventory events', async () => {
      // Test parameters
      const storeId = 'store-123';
      const inventoryData = { product_id: 'prod-123', quantity: 5 };
      
      // Call the service method
      const result = await realTimeTrackingService.trackInventoryEvent(storeId, inventoryData);
      
      // Verify the service was called with correct parameters
      expect(realTimeTrackingService.trackInventoryEvent).toHaveBeenCalledWith(storeId, inventoryData);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', storeId);
      expect(result).toHaveProperty('event_type', 'inventory');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(inventoryData);
    });
  });
}); 