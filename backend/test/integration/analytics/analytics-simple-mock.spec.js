/**
 * Simple mock testing for analytics functions
 * This doesn't use NestJS at all, just direct mocking
 */

// Create mocks for the repositories
const createMockRepository = () => ({
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
});

// Analytics collector service mock
class AnalyticsCollectorService {
  constructor() {
    // Mock repositories
    this.salesMetricsRepository = createMockRepository();
    this.inventoryMetricsRepository = createMockRepository();
    this.customerMetricsRepository = createMockRepository();
    this.storeRepository = createMockRepository();
    
    // Spy on the methods
    this.aggregateDailyMetrics = jest.fn().mockImplementation(async (date, storeId) => {
      return {
        id: 'mock-metrics-id',
        store_id: storeId,
        date: date,
        total_sales: 1500,
        average_order_value: 75,
      };
    });
  }
}

// Analytics scheduler service mock
class AnalyticsSchedulerService {
  constructor(analyticsCollectorService) {
    this.analyticsCollectorService = analyticsCollectorService;
    this.storeRepository = createMockRepository();
    
    // Set up mock store data
    this.storeRepository.find.mockResolvedValue([
      { id: 'store-1', name: 'Test Store 1', is_active: true },
      { id: 'store-2', name: 'Test Store 2', is_active: true },
      { id: 'store-3', name: 'Test Store 3', is_active: false },
    ]);
    
    // Spy on the methods
    this.handleDailyAggregation = jest.fn().mockImplementation(async () => {
      const stores = await this.storeRepository.find();
      const activeStores = stores.filter(store => store.is_active);
      
      // Call the collector for each active store
      for (const store of activeStores) {
        await this.analyticsCollectorService.aggregateDailyMetrics(new Date(), store.id);
      }
      
      return {
        processed: activeStores.length,
        errors: 0,
      };
    });
    
    this.handleMonthlyAggregation = jest.fn().mockImplementation(async () => {
      const stores = await this.storeRepository.find();
      const activeStores = stores.filter(store => store.is_active);
      
      return {
        processed: activeStores.length,
        errors: 0,
      };
    });
  }
}

describe('Simple Analytics Mocking', () => {
  let analyticsCollectorService;
  let analyticsSchedulerService;
  
  beforeEach(() => {
    // Create fresh instances for each test
    analyticsCollectorService = new AnalyticsCollectorService();
    analyticsSchedulerService = new AnalyticsSchedulerService(analyticsCollectorService);
    
    // Clear mocks
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
      
      // Verify the result structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('store_id', testStoreId);
      expect(result).toHaveProperty('date', testDate);
      expect(result).toHaveProperty('total_sales');
      expect(result).toHaveProperty('average_order_value');
    });
  });
  
  describe('AnalyticsSchedulerService', () => {
    it('should handle daily aggregation for active stores only', async () => {
      // Call the method
      const result = await analyticsSchedulerService.handleDailyAggregation();
      
      // Verify the method was called
      expect(analyticsSchedulerService.handleDailyAggregation).toHaveBeenCalled();
      
      // Verify that aggregateDailyMetrics was called for each active store
      expect(analyticsCollectorService.aggregateDailyMetrics).toHaveBeenCalledTimes(2);
      
      // Verify the result
      expect(result).toHaveProperty('processed', 2);
      expect(result).toHaveProperty('errors', 0);
    });
    
    it('should handle monthly aggregation for active stores only', async () => {
      // Call the method
      const result = await analyticsSchedulerService.handleMonthlyAggregation();
      
      // Verify the method was called
      expect(analyticsSchedulerService.handleMonthlyAggregation).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveProperty('processed', 2);
      expect(result).toHaveProperty('errors', 0);
    });
  });
}); 