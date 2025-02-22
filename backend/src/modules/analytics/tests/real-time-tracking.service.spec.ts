/**
 * Unit tests for the Real-Time Tracking Service
 * Tests user activity monitoring and real-time analytics functionality
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('RealTimeTrackingService', () => {
  let service: RealTimeTrackingService;
  let mockRepository: Partial<Repository<RealTimeMetrics>>;
  let mockDataSource: Partial<DataSource>;
  let mockEventEmitter: Partial<EventEmitter2>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      create: jest.fn(),
    };

    mockEntityManager = {
      save: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockReturnValue({
        timestamp: new Date(),
        active_users: 1,
        active_sessions: 1,
        cart_count: 0,
        cart_value: 0,
        pending_orders: 0,
        pending_revenue: 0,
        current_popular_products: [],
        traffic_sources: [],
        page_views: [],
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          cart_count: 0,
          cart_value: 0,
          pending_count: 0,
          pending_value: 0,
        }),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation((runInTransaction) => {
        if (typeof runInTransaction === 'function') {
          return Promise.resolve(runInTransaction(mockEntityManager as EntityManager));
        }
        return Promise.resolve();
      }),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealTimeTrackingService,
        {
          provide: getRepositoryToken(RealTimeMetrics),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<RealTimeTrackingService>(RealTimeTrackingService);

    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => 1614556800000); // 2021-03-01
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Tests for tracking page views
   * Verifies proper recording and counting of user page visits
   */
  describe('trackPageView', () => {
    it('should increment page view count and update metrics', async () => {
      const page = '/products';
      const sessionId = 'session123';
      
      await service.trackPageView(page, sessionId);
      
      const pageViews = service.getPageViewCounts();
      expect(pageViews.get(page)).toBe(1);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('analytics.realtime.updated', expect.any(Object));
    });

    it('should accumulate multiple views for the same page', async () => {
      const page = '/products';
      const sessionId = 'session123';
      
      await service.trackPageView(page, sessionId);
      await service.trackPageView(page, sessionId);
      
      const pageViews = service.getPageViewCounts();
      expect(pageViews.get(page)).toBe(2);
    });
  });

  /**
   * Tests for tracking user activity
   * Verifies proper recording of user interactions and session management
   */
  describe('trackUserActivity', () => {
    it('should add user session and update metrics', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      
      await service.trackUserActivity(userId, sessionId);
      
      expect(service.getActiveUserCount()).toBe(1);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('analytics.realtime.updated', expect.any(Object));
    });

    it('should not count the same session twice', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      
      await service.trackUserActivity(userId, sessionId);
      await service.trackUserActivity(userId, sessionId);
      
      expect(service.getActiveUserCount()).toBe(1);
    });
  });

  /**
   * Tests for tracking traffic source
   * Verifies proper tracking and reporting of user traffic sources
   */
  describe('trackTrafficSource', () => {
    it('should record traffic source and update metrics', async () => {
      const source = 'google';
      const sessionId = 'session123';
      
      await service.trackTrafficSource(source, sessionId);
      
      const distribution = service.getTrafficSourceDistribution();
      expect(distribution.get(source)).toBe(1);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('analytics.realtime.updated', expect.any(Object));
    });

    it('should count unique sessions per source', async () => {
      const source = 'google';
      const sessionId1 = 'session123';
      const sessionId2 = 'session456';
      
      await service.trackTrafficSource(source, sessionId1);
      await service.trackTrafficSource(source, sessionId2);
      
      const distribution = service.getTrafficSourceDistribution();
      expect(distribution.get(source)).toBe(2);
    });

    it('should not count the same session twice for a source', async () => {
      const source = 'google';
      const sessionId = 'session123';
      
      await service.trackTrafficSource(source, sessionId);
      await service.trackTrafficSource(source, sessionId);
      
      const distribution = service.getTrafficSourceDistribution();
      expect(distribution.get(source)).toBe(1);
    });
  });

  /**
   * Tests for cleanup and metrics update
   * Verifies proper cleanup of tracking information and metrics updates
   */
  describe('updateRealTimeMetrics', () => {
    it('should remove inactive sessions after 15 minutes', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      await service.trackUserActivity(userId, sessionId);
      
      // Mock time passing (16 minutes)
      jest.spyOn(Date, 'now').mockImplementation(() => 1614556800000 + (16 * 60 * 1000));
      
      // Trigger metrics update
      await service['updateRealTimeMetrics']();
      
      expect(service.getActiveUserCount()).toBe(0);
    });

    it('should update metrics with latest data', async () => {
      await service['updateRealTimeMetrics']();
      
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('analytics.realtime.updated', expect.any(Object));
    });
  });
});
