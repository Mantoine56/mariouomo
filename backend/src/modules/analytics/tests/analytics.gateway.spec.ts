/**
 * Unit tests for the Analytics Gateway
 * Tests WebSocket functionality for real-time analytics updates
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsGateway } from '../gateways/analytics.gateway';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { Socket } from 'socket.io';

describe('AnalyticsGateway', () => {
  let gateway: AnalyticsGateway;
  let trackingService: RealTimeTrackingService;

  // Mock implementations of required services and socket
  const mockClient = {
    id: 'testClientId',
    emit: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as Socket;

  const mockMetrics: RealTimeMetrics = {
    id: 'metrics-1',
    active_users: 5,
    active_sessions: 3,
    cart_count: 2,
    cart_value: 150,
    pending_orders: 1,
    pending_revenue: 75.5,
    current_popular_products: [],
    traffic_sources: [],
    page_views: [],
    created_at: new Date(),
    updated_at: new Date(),
    timestamp: new Date()
  };

  const mockRealTimeMetrics: RealTimeMetrics = {
    id: '123',
    active_users: 10,
    active_sessions: 5,
    cart_count: 3,
    cart_value: 250,
    pending_orders: 2,
    pending_revenue: 180,
    current_popular_products: [],
    traffic_sources: [],
    page_views: [],
    created_at: new Date(),
    updated_at: new Date(),
    timestamp: new Date()
  };

  const mockTrackingService = {
    trackUserActivity: jest.fn(),
    trackPageView: jest.fn(),
    trackTrafficSource: jest.fn(),
    removeUser: jest.fn(),
    getCurrentMetrics: jest.fn().mockResolvedValue(mockMetrics),
    updateMetrics: jest.fn().mockResolvedValue(mockRealTimeMetrics),
  };

  beforeEach(async () => {
    // Set up testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsGateway,
        {
          provide: RealTimeTrackingService,
          useValue: mockTrackingService,
        },
      ],
    }).compile();

    gateway = module.get<AnalyticsGateway>(AnalyticsGateway);
    trackingService = module.get<RealTimeTrackingService>(RealTimeTrackingService);
    
    // Mock the WebSocket server
    gateway.server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as any;
  });

  /**
   * Verifies that the gateway is properly defined
   */
  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  /**
   * Tests for client connection handling
   * Verifies proper setup of WebSocket connections
   */
  describe('handleConnection', () => {
    it('should handle socket connection and track user activity', async () => {
      const client = {
        id: 'test-client',
        emit: jest.fn(),
        handshake: {},
        conn: {},
        rooms: new Set(),
        data: {},
      } as unknown as Socket;

      await gateway.handleConnection(client);
      
      expect(trackingService.trackUserActivity).toHaveBeenCalledWith(client.id, client.id);
      // Initial metrics are not emitted in handleConnection anymore
    });
  });

  /**
   * Tests for client disconnection handling
   * Verifies proper cleanup of WebSocket connections
   */
  describe('handleDisconnect', () => {
    it('should handle socket disconnection', async () => {
      const client = {
        id: 'test-client',
      } as Socket;

      await gateway.handleDisconnect(client);
      
      expect(trackingService.removeUser).toHaveBeenCalledWith(client.id);
    });
  });

  /**
   * Tests for page view tracking
   * Verifies proper tracking of page views
   */
  describe('handlePageView', () => {
    it('should track page view', async () => {
      const page = '/products';
      const client = { id: 'testClientId' } as Socket;

      await gateway.handlePageView(client, { page });

      expect(trackingService.trackPageView).toHaveBeenCalledWith(page, client.id);
    });
  });

  /**
   * Tests for traffic source tracking
   * Verifies proper tracking of traffic sources
   */
  describe('handleTrafficSource', () => {
    it('should track traffic source', async () => {
      const source = 'google';
      const client = { id: 'testClientId' } as Socket;

      await gateway.handleTrafficSource(client, { source });

      expect(trackingService.trackTrafficSource).toHaveBeenCalledWith(source, client.id);
    });
  });

  /**
   * Tests for real-time metrics broadcasting
   * Verifies proper emission of analytics updates to connected clients
   */
  describe('metrics updates', () => {
    it('should broadcast metrics updates to subscribed clients', async () => {
      // Set up a mock client subscribed to realtime metrics
      const client = {
        id: 'test-client',
        emit: jest.fn(),
        handshake: {},
        conn: {},
        rooms: new Set(),
        data: {},
        join: jest.fn(),
        leave: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;

      // Add client to active dashboards
      (gateway as any).activeDashboards.set(client.id, client);
      
      // Subscribe client to realtime metrics
      gateway.handleRealtimeSubscription(client);
      
      // Trigger metrics update
      await gateway.handleRealtimeUpdate(mockMetrics);
      
      // Verify the client receives the update
      expect(client.emit).toHaveBeenCalledWith('realtime_update', mockMetrics);
    });
  });
});
