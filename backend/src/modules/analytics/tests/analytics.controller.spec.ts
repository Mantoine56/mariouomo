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
            getRealTimeDashboard: jest.fn().mockResolvedValue(mockRealTimeData),
            getProductPerformance: jest.fn(),
            getCategoryPerformance: jest.fn(),
          },
        },
        {
          provide: RealTimeTrackingService,
          useValue: {
            getCurrentMetrics: jest.fn().mockResolvedValue(mockRealTimeData),
            getActiveUserCount: jest.fn().mockResolvedValue(150),
            getPageViewDistribution: jest.fn().mockResolvedValue([
              { page: '/home', views: 50, average_time: 120 },
              { page: '/products', views: 30, average_time: 180 },
            ]),
            getTrafficSourceDistribution: jest.fn(),
            getPageViewCounts: jest.fn(),
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

  describe('getSalesOverview', () => {
    it('should return sales overview for a date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await controller.getSalesOverview(startDate, endDate);

      expect(result).toEqual(mockSalesData);
      expect(queryService.getSalesOverview).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('getInventoryOverview', () => {
    it('should return current inventory statistics', async () => {
      const date = new Date('2025-02-01');

      const result = await controller.getInventoryOverview(date);

      expect(result).toEqual(mockInventoryData);
      expect(queryService.getInventoryOverview).toHaveBeenCalledWith(date);
    });
  });

  describe('getCustomerInsights', () => {
    it('should return customer behavior analysis for a date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await controller.getCustomerInsights(startDate, endDate);

      expect(result).toEqual(mockCustomerData);
      expect(queryService.getCustomerInsights).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('getRealTimeDashboard', () => {
    it('should return real-time metrics', async () => {
      const result = await controller.getRealTimeDashboard();

      expect(result).toEqual(mockRealTimeData);
      expect(trackingService.getCurrentMetrics).toHaveBeenCalled();
    });
  });

  describe('getActiveUserCount', () => {
    it('should return current active user count', async () => {
      const result = await controller.getActiveUserCount();

      expect(result).toBe(150);
      expect(trackingService.getActiveUserCount).toHaveBeenCalled();
    });
  });

  describe('getPageViewDistribution', () => {
    it('should return page view distribution', async () => {
      const expectedDistribution = [
        { page: '/home', views: 50, average_time: 120 },
        { page: '/products', views: 30, average_time: 180 },
      ];

      const result = await controller.getPageViewDistribution();

      expect(result).toEqual(expectedDistribution);
      expect(trackingService.getPageViewDistribution).toHaveBeenCalled();
    });
  });

  describe('getProductPerformance', () => {
    it('should return product performance metrics', async () => {
      const result = await controller.getProductPerformance();

      expect(result).toBeDefined();
      expect(queryService.getProductPerformance).toHaveBeenCalled();
    });
  });

  describe('getCategoryPerformance', () => {
    it('should return category performance metrics', async () => {
      const result = await controller.getCategoryPerformance();

      expect(result).toBeDefined();
      expect(queryService.getCategoryPerformance).toHaveBeenCalled();
    });
  });

  describe('getTrafficSourceDistribution', () => {
    it('should return traffic source distribution', async () => {
      const result = await controller.getTrafficSourceDistribution();

      expect(result).toBeDefined();
      expect(trackingService.getTrafficSourceDistribution).toHaveBeenCalled();
    });
  });

  describe('getPageViewCounts', () => {
    it('should return page view counts', async () => {
      const result = await controller.getPageViewCounts();

      expect(result).toBeDefined();
      expect(trackingService.getPageViewCounts).toHaveBeenCalled();
    });
  });
});
