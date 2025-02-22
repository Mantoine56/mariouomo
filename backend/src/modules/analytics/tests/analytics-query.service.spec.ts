/**
 * Unit tests for the Analytics Query Service
 * Tests data aggregation and analysis functionality for the analytics module
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { Repository } from 'typeorm';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AnalyticsQueryService', () => {
  let service: AnalyticsQueryService;
  let salesRepo: jest.Mocked<Repository<SalesMetrics>>;
  let inventoryRepo: jest.Mocked<Repository<InventoryMetrics>>;
  let customerRepo: jest.Mocked<Repository<CustomerMetrics>>;
  let realTimeRepo: jest.Mocked<Repository<RealTimeMetrics>>;

  beforeEach(async () => {
    // Create mock repositories with all required methods
    const createMockRepo = () => ({
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsQueryService,
        {
          provide: getRepositoryToken(SalesMetrics),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(InventoryMetrics),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(CustomerMetrics),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(RealTimeMetrics),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get<AnalyticsQueryService>(AnalyticsQueryService);
    salesRepo = module.get(getRepositoryToken(SalesMetrics));
    inventoryRepo = module.get(getRepositoryToken(InventoryMetrics));
    customerRepo = module.get(getRepositoryToken(CustomerMetrics));
    realTimeRepo = module.get(getRepositoryToken(RealTimeMetrics));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesOverview', () => {
    it('should return aggregated sales data for a given date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const mockSalesData = [
        {
          revenue: 1000,
          orders: 10,
          avg_order_value: 100,
          date: new Date('2025-01-15'),
        },
      ];

      // Setup mock query builder to return our mock data
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockSalesData),
      };

      salesRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getSalesOverview(startDate, endDate);

      expect(result).toEqual({
        revenue: 1000,
        orders: 10,
        averageOrderValue: 100,
        trend: [
          {
            date: expect.any(Date),
            revenue: 1000,
            orders: 10,
          },
        ],
      });
    });

    it('should handle empty results', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await service.getSalesOverview(startDate, endDate);

      expect(result).toEqual({
        revenue: 0,
        orders: 0,
        averageOrderValue: 0,
        trend: [],
      });
    });
  });

  describe('getInventoryOverview', () => {
    it('should return current inventory statistics', async () => {
      const date = new Date('2025-01-31');

      const mockInventoryData = {
        total_items: 100,
        low_stock_items: 10,
        out_of_stock_items: 5,
        turnover_rate: 0.8,
        date: new Date('2025-01-31'),
      };

      // Setup mock query builder to return our mock data
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockInventoryData),
      };

      inventoryRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getInventoryOverview(date);

      expect(result).toEqual({
        current: {
          totalItems: 100,
          lowStockItems: 10,
          outOfStockItems: 5,
          turnoverRate: 0.8,
        },
        turnoverTrend: [
          {
            date: expect.any(Date),
            turnoverRate: 0.8,
          },
        ],
      });
    });

    it('should handle missing inventory data', async () => {
      const date = new Date();

      const result = await service.getInventoryOverview(date);

      expect(result).toEqual({
        current: {
          totalItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          turnoverRate: 0,
        },
        turnoverTrend: [
          {
            date: expect.any(Date),
            turnoverRate: 0,
          },
        ],
      });
    });
  });

  describe('getRealTimeDashboard', () => {
    it('should return current metrics and trends', async () => {
      const mockCurrent = {
        active_users: 100,
        page_views: 500,
        traffic_sources: ['direct', 'organic'],
      };

      const mockTrends = [
        {
          timestamp: new Date('2025-01-01T10:00:00Z'),
          active_users: 80,
          page_views: 400,
        },
        {
          timestamp: new Date('2025-01-01T10:30:00Z'),
          active_users: 90,
          page_views: 450,
        },
      ];

      // Setup mock query builders for current and trend data
      const mockCurrentQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCurrent),
      };

      const mockTrendQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTrends),
      };

      // Setup different query builders for each call
      realTimeRepo.createQueryBuilder = jest.fn()
        .mockReturnValueOnce(mockCurrentQueryBuilder)
        .mockReturnValueOnce(mockTrendQueryBuilder);

      const result = await service.getRealTimeDashboard();

      expect(result).toEqual({
        current: {
          activeUsers: 100,
          pageViews: 500,
          trafficSources: ['direct', 'organic'],
        },
        trends: {
          activeUsers: [
            { timestamp: expect.any(Date), users: 80 },
            { timestamp: expect.any(Date), users: 90 },
          ],
          pageViews: [
            { timestamp: expect.any(Date), views: 400 },
            { timestamp: expect.any(Date), views: 450 },
          ],
        },
      });
    });

    it('should handle empty data gracefully', async () => {
      // Setup mock query builders to return null/empty data
      const mockCurrentQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      const mockTrendQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      realTimeRepo.createQueryBuilder = jest.fn()
        .mockReturnValueOnce(mockCurrentQueryBuilder)
        .mockReturnValueOnce(mockTrendQueryBuilder);

      const result = await service.getRealTimeDashboard();

      expect(result).toEqual({
        current: {
          activeUsers: 0,
          pageViews: 0,
          trafficSources: [],
        },
        trends: {
          activeUsers: [],
          pageViews: [],
        },
      });
    });
  });
});
