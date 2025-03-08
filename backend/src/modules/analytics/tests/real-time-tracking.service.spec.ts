/**
 * Unit tests for the Real-Time Tracking Service
 * Tests user activity monitoring and real-time analytics functionality
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RealTimeTrackingTestModule } from '../../../../test/integration/analytics/real-time-tracking-test.module';
import { DbUtilsTestService } from '../../../../test/utils/db-utils-test.service';
import { ShoppingCartTestRepository } from '../../../../test/utils/shopping-cart-test.repository';

describe('RealTimeTrackingService', () => {
  let service: RealTimeTrackingService;
  let realTimeMetricsRepo: Repository<RealTimeMetrics>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;
  let dbUtilsService: DbUtilsTestService;
  let shoppingCartRepository: ShoppingCartTestRepository;

  beforeEach(async () => {
    // Use RealTimeTrackingTestModule to provide real database access
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RealTimeTrackingTestModule,
      ],
    }).compile();

    service = module.get<RealTimeTrackingService>(RealTimeTrackingService);
    realTimeMetricsRepo = module.get<Repository<RealTimeMetrics>>(getRepositoryToken(RealTimeMetrics));
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    dbUtilsService = module.get<DbUtilsTestService>(DbUtilsTestService);
    shoppingCartRepository = module.get<ShoppingCartTestRepository>(ShoppingCartTestRepository);

    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => 1614556800000); // 2021-03-01
  });

  afterEach(async () => {
    // Clean up test data after each test
    await dataSource.query('TRUNCATE TABLE real_time_metrics CASCADE');
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
    it('should manage user sessions', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      
      // Track a user
      await service.trackUserActivity(userId, sessionId);
      
      // Verify users are being tracked
      expect(service.getActiveUserCount()).toBeGreaterThan(0);
      
      // Manually remove the user
      await service.removeUser(sessionId);
      
      // Verify user count has decreased
      expect(service.getActiveUserCount()).toBe(0);
    });

    it('should update metrics with latest data', async () => {
      // Set up some test data
      const sessionId = 'session123';
      await service.trackUserActivity('user123', sessionId);
      await service.trackPageView('/products', sessionId);
      
      // Execute the method under test
      await service['updateRealTimeMetrics']();
      
      // Check that metrics were persisted to the database
      const metrics = await realTimeMetricsRepo.find({
        order: { timestamp: 'DESC' },
        take: 1,
      });
      
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].active_users).toBeGreaterThanOrEqual(1);
    });
  });
});
