/**
 * Unit tests for the Analytics Controller
 * Tests the handling of analytics-related HTTP requests and responses
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let queryService: AnalyticsQueryService;
  let trackingService: RealTimeTrackingService;

  const mockSalesData = {
    revenue: 50000,
    orders: 100,
    averageOrderValue: 500,
    trend: [
      { date: new Date('2025-01-01'), revenue: 1000, orders: 20 },
      { date: new Date('2025-01-02'), revenue: 1500, orders: 30 },
    ],
  };

  const mockInventoryData = {
    current: {
      totalItems: 500,
      lowStockItems: 10,
    },
    turnoverTrend: [
      { date: new Date('2025-01-01'), turnover_rate: 2.5 },
    ],
  };

  const mockCustomerData = {
    retention: 85,
    churn: 15,
    newCustomers: 100,
    repeatCustomers: 500,
    trend: [
      { date: new Date('2025-01-01'), retention: 85, churn: 15 },
    ],
  };

  const mockRealTimeData = {
    activeUsers: 150,
    pageViews: [
      { page: '/home', views: 50, average_time: 120 },
      { page: '/products', views: 30, average_time: 180 },
    ],
    trafficSources: [
      { source: 'google', active_users: 30, conversion_rate: 2.5 },
      { source: 'direct', active_users: 20, conversion_rate: 3.0 },
    ],
  };

  const mockProductPerformance = {
    sales: 1000,
    revenue: 50000,
    views: 5000,
    trend: [
      { date: new Date('2025-01-01'), sales: 100, revenue: 5000 },
    ],
  };

  const mockCategoryPerformance = {
    sales: 2000,
    revenue: 100000,
    products: 50,
    trend: [
      { date: new Date('2025-01-01'), sales: 200, revenue: 10000 },
    ],
  };

  const mockTrafficSources = {
    sources: [
      { source: 'google', visits: 1000, conversion_rate: 2.5 },
      { source: 'direct', visits: 500, conversion_rate: 3.0 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsQueryService,
          useValue: {
            getSalesOverview: jest.fn().mockResolvedValue(mockSalesData),
            getInventoryOverview: jest.fn().mockResolvedValue(mockInventoryData),
            getCustomerInsights: jest.fn().mockResolvedValue(mockCustomerData),
            getProductPerformance: jest.fn().mockResolvedValue(mockProductPerformance),
            getCategoryPerformance: jest.fn().mockResolvedValue(mockCategoryPerformance),
            getTrafficSourceDistribution: jest.fn().mockResolvedValue(mockTrafficSources),
            getCurrentMetrics: jest.fn().mockResolvedValue(mockRealTimeData),
          },
        },
        {
          provide: RealTimeTrackingService,
          useValue: {
            getCurrentMetrics: jest.fn().mockResolvedValue(mockRealTimeData),
            getActiveUserCount: jest.fn().mockResolvedValue(150),
            getPageViewCounts: jest.fn().mockResolvedValue(mockRealTimeData.pageViews),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    queryService = module.get<AnalyticsQueryService>(AnalyticsQueryService);
    trackingService = module.get<RealTimeTrackingService>(RealTimeTrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /analytics/sales', () => {
    it('should get sales analytics', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await controller.getSales(startDate, endDate);

      expect(queryService.getSalesOverview).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockSalesData);
    });
  });

  describe('GET /analytics/inventory', () => {
    it('should get inventory analytics', async () => {
      const date = new Date('2025-01-01');
      const result = await controller.getInventory(date);

      expect(queryService.getInventoryOverview).toHaveBeenCalledWith(date);
      expect(result).toEqual(mockInventoryData);
    });
  });

  describe('GET /analytics/customers', () => {
    it('should get customer analytics', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await controller.getCustomers(startDate, endDate);

      expect(queryService.getCustomerInsights).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockCustomerData);
    });
  });

  describe('GET /analytics/realtime/dashboard', () => {
    it('should get real-time dashboard data', async () => {
      const result = await controller.getRealTimeDashboard();

      expect(trackingService.getCurrentMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockRealTimeData);
    });
  });

  describe('GET /analytics/active-users', () => {
    it('should get active user count', async () => {
      const result = await controller.getActiveUsers();

      expect(trackingService.getActiveUserCount).toHaveBeenCalled();
      expect(result).toEqual(150);
    });
  });

  describe('GET /analytics/products/performance', () => {
    it('should get product performance metrics', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await controller.getProductPerformance(startDate, endDate);

      expect(queryService.getProductPerformance).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockProductPerformance);
    });
  });

  describe('GET /analytics/categories/performance', () => {
    it('should get category performance metrics', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await controller.getCategoryPerformance(startDate, endDate);

      expect(queryService.getCategoryPerformance).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockCategoryPerformance);
    });
  });

  describe('GET /analytics/traffic-sources', () => {
    it('should get traffic source distribution', async () => {
      const result = await controller.getTrafficSourceDistribution();

      expect(queryService.getTrafficSourceDistribution).toHaveBeenCalled();
      expect(result).toEqual(mockTrafficSources);
    });
  });
});
