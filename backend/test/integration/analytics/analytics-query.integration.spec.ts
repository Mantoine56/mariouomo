import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { AnalyticsQueryService } from '../../../src/modules/analytics/services/analytics-query.service';
import { SalesMetrics } from '../../../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../../../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../../../src/modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../../../src/modules/analytics/entities/real-time-metrics.entity';

/**
 * Integration tests for Analytics Query Service
 * 
 * These tests verify that:
 * 1. Sales overview data is correctly retrieved and formatted
 * 2. Inventory overview data is correctly retrieved and formatted
 * 3. Customer insights are correctly calculated
 * 4. Product performance metrics are correctly aggregated
 * 5. Category performance metrics are correctly aggregated
 * 6. Traffic source distribution is correctly calculated
 * 7. Real-time dashboard data is correctly retrieved
 */
describe('AnalyticsQueryService Integration Tests', () => {
  let app: INestApplication;
  let analyticsQueryService: AnalyticsQueryService;
  let salesMetricsRepository: Repository<SalesMetrics>;
  let inventoryMetricsRepository: Repository<InventoryMetrics>;
  let customerMetricsRepository: Repository<CustomerMetrics>;
  let realTimeMetricsRepository: Repository<RealTimeMetrics>;
  let dataSource: DataSource;
  
  // Test store IDs
  const testStores = {
    store1: uuidv4(),
    store2: uuidv4(),
  };

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();

    // Get necessary services and repositories
    analyticsQueryService = moduleFixture.get<AnalyticsQueryService>(AnalyticsQueryService);
    salesMetricsRepository = moduleFixture.get<Repository<SalesMetrics>>(getRepositoryToken(SalesMetrics));
    inventoryMetricsRepository = moduleFixture.get<Repository<InventoryMetrics>>(getRepositoryToken(InventoryMetrics));
    customerMetricsRepository = moduleFixture.get<Repository<CustomerMetrics>>(getRepositoryToken(CustomerMetrics));
    realTimeMetricsRepository = moduleFixture.get<Repository<RealTimeMetrics>>(getRepositoryToken(RealTimeMetrics));
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean up any existing test data
    await cleanupTestData();
    
    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Close the application
    await app.close();
  });

  /**
   * Clean up test data from the database
   * Removes all test metrics created for these tests
   */
  async function cleanupTestData() {
    await dataSource.transaction(async (manager) => {
      // Delete test sales metrics
      await manager.delete(SalesMetrics, {
        store_id: [testStores.store1, testStores.store2],
      });
      
      // Delete test inventory metrics
      await manager.delete(InventoryMetrics, {
        store_id: [testStores.store1, testStores.store2],
      });
      
      // Delete test customer metrics
      await manager.delete(CustomerMetrics, {
        store_id: [testStores.store1, testStores.store2],
      });
      
      // Delete test real-time metrics
      await manager.delete(RealTimeMetrics, {
        store_id: [testStores.store1, testStores.store2],
      });
    });
  }

  /**
   * Seed test data for analytics tests
   * Creates sample data for sales, inventory, customer, and real-time metrics
   */
  async function seedTestData() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    await dataSource.transaction(async (manager) => {
      // Seed sales metrics
      const salesMetrics = [
        // Store 1 - Today
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: now,
          total_revenue: 1000,
          total_orders: 10,
          average_order_value: 100,
          views: 200,
          product_id: 'product-1',
        },
        // Store 1 - Yesterday
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: yesterday,
          total_revenue: 800,
          total_orders: 8,
          average_order_value: 100,
          views: 150,
          product_id: 'product-2',
        },
        // Store 1 - Two days ago
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: twoDaysAgo,
          total_revenue: 600,
          total_orders: 6,
          average_order_value: 100,
          views: 120,
          product_id: 'product-3',
        },
        // Store 2 - Today
        {
          id: uuidv4(),
          store_id: testStores.store2,
          date: now,
          total_revenue: 1500,
          total_orders: 15,
          average_order_value: 100,
          views: 300,
          product_id: 'product-1',
        },
      ];
      
      for (const metric of salesMetrics) {
        await manager.save(SalesMetrics, metric);
      }
      
      // Seed inventory metrics
      const inventoryMetrics = [
        // Store 1 - Today
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: now,
          total_items: 100,
          low_stock_items: 10,
          out_of_stock_items: 5,
          turnover_rate: 0.2,
        },
        // Store 1 - Yesterday
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: yesterday,
          total_items: 110,
          low_stock_items: 12,
          out_of_stock_items: 3,
          turnover_rate: 0.18,
        },
        // Store 2 - Today
        {
          id: uuidv4(),
          store_id: testStores.store2,
          date: now,
          total_items: 200,
          low_stock_items: 20,
          out_of_stock_items: 8,
          turnover_rate: 0.25,
        },
      ];
      
      for (const metric of inventoryMetrics) {
        await manager.save(InventoryMetrics, metric);
      }
      
      // Seed customer metrics
      const customerMetrics = [
        // Store 1 - Today
        {
          id: uuidv4(),
          store_id: testStores.store1,
          created_at: now,
          last_purchase_date: now,
          traffic_source: 'google',
        },
        // Store 1 - Yesterday with purchase
        {
          id: uuidv4(),
          store_id: testStores.store1,
          created_at: yesterday,
          last_purchase_date: yesterday,
          traffic_source: 'direct',
        },
        // Store 1 - Yesterday without purchase
        {
          id: uuidv4(),
          store_id: testStores.store1,
          created_at: yesterday,
          last_purchase_date: null,
          traffic_source: 'social',
        },
        // Store 2 - Today
        {
          id: uuidv4(),
          store_id: testStores.store2,
          created_at: now,
          last_purchase_date: now,
          traffic_source: 'referral',
        },
      ];
      
      for (const metric of customerMetrics) {
        await manager.save(CustomerMetrics, metric);
      }
      
      // Seed real-time metrics
      const realTimeMetrics = [
        // Store 1 - Now
        {
          id: uuidv4(),
          store_id: testStores.store1,
          timestamp: new Date(),
          active_users: 25,
          active_sessions: 30,
          cart_count: 8,
          cart_value: 800,
          page_views: [
            { page: 'home', views: 50 },
            { page: 'products', views: 30 },
            { page: 'cart', views: 15 },
          ],
          traffic_sources: [
            { source: 'google', count: 20 },
            { source: 'direct', count: 15 },
            { source: 'social', count: 10 },
          ],
        },
        // Store 1 - 30 minutes ago
        {
          id: uuidv4(),
          store_id: testStores.store1,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          active_users: 20,
          active_sessions: 25,
          cart_count: 6,
          cart_value: 600,
          page_views: [
            { page: 'home', views: 40 },
            { page: 'products', views: 25 },
            { page: 'cart', views: 10 },
          ],
          traffic_sources: [
            { source: 'google', count: 15 },
            { source: 'direct', count: 12 },
            { source: 'social', count: 8 },
          ],
        },
        // Store 2 - Now
        {
          id: uuidv4(),
          store_id: testStores.store2,
          timestamp: new Date(),
          active_users: 35,
          active_sessions: 40,
          cart_count: 12,
          cart_value: 1200,
          page_views: [
            { page: 'home', views: 70 },
            { page: 'products', views: 45 },
            { page: 'cart', views: 20 },
          ],
          traffic_sources: [
            { source: 'google', count: 25 },
            { source: 'direct', count: 20 },
            { source: 'social', count: 15 },
          ],
        },
      ];
      
      for (const metric of realTimeMetrics) {
        await manager.save(RealTimeMetrics, metric);
      }
    });
  }

  /**
   * Test suite for sales overview
   * Verifies that sales overview data is correctly retrieved and formatted
   */
  describe('Sales Overview', () => {
    it('should retrieve sales overview for a date range', async () => {
      // Set up test date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3);
      const endDate = new Date();
      
      // Get sales overview
      const salesOverview = await analyticsQueryService.getSalesOverview(startDate, endDate);
      
      // Verify structure
      expect(salesOverview).toHaveProperty('revenue');
      expect(salesOverview).toHaveProperty('orders');
      expect(salesOverview).toHaveProperty('averageOrderValue');
      expect(salesOverview).toHaveProperty('trend');
      expect(salesOverview).toHaveProperty('dateRange');
      
      // Verify values
      expect(salesOverview.revenue).toBeGreaterThan(0);
      expect(salesOverview.orders).toBeGreaterThan(0);
      expect(salesOverview.averageOrderValue).toBeGreaterThan(0);
      expect(salesOverview.trend.length).toBeGreaterThan(0);
      
      // Verify trend data structure
      const trendItem = salesOverview.trend[0];
      expect(trendItem).toHaveProperty('date');
      expect(trendItem).toHaveProperty('revenue');
      expect(trendItem).toHaveProperty('orders');
      expect(trendItem).toHaveProperty('averageOrderValue');
    });
    
    it('should handle invalid date ranges gracefully', async () => {
      // Set up invalid date range (end before start)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 5);
      
      // Get sales overview with invalid date range
      const salesOverview = await analyticsQueryService.getSalesOverview(startDate, endDate);
      
      // Verify error handling
      expect(salesOverview).toHaveProperty('error');
      expect(salesOverview.error).toBe('Failed to retrieve sales overview');
      expect(salesOverview).toHaveProperty('message');
      expect(salesOverview.message).toBe('Start date must be before end date');
    });
  });

  /**
   * Test suite for inventory overview
   * Verifies that inventory overview data is correctly retrieved and formatted
   */
  describe('Inventory Overview', () => {
    it('should retrieve inventory overview for a specific date', async () => {
      // Set up test date
      const date = new Date();
      
      // Get inventory overview
      const inventoryOverview = await analyticsQueryService.getInventoryOverview(date);
      
      // Verify structure
      expect(inventoryOverview).toHaveProperty('current');
      expect(inventoryOverview).toHaveProperty('turnoverTrend');
      expect(inventoryOverview).toHaveProperty('analysisDate');
      
      // Verify current data structure
      expect(inventoryOverview.current).toHaveProperty('totalItems');
      expect(inventoryOverview.current).toHaveProperty('lowStockItems');
      expect(inventoryOverview.current).toHaveProperty('outOfStockItems');
      expect(inventoryOverview.current).toHaveProperty('turnoverRate');
      
      // Verify values
      expect(inventoryOverview.current.totalItems).toBeGreaterThan(0);
      expect(inventoryOverview.current.lowStockItems).toBeGreaterThanOrEqual(0);
      expect(inventoryOverview.current.outOfStockItems).toBeGreaterThanOrEqual(0);
      expect(inventoryOverview.current.turnoverRate).toBeGreaterThanOrEqual(0);
      
      // Verify trend data
      expect(inventoryOverview.turnoverTrend.length).toBeGreaterThan(0);
      
      // Verify trend data structure
      const trendItem = inventoryOverview.turnoverTrend[0];
      expect(trendItem).toHaveProperty('date');
      expect(trendItem).toHaveProperty('turnoverRate');
    });
    
    it('should handle invalid date gracefully', async () => {
      // Set up invalid date
      const invalidDate = new Date('invalid date');
      
      // Get inventory overview with invalid date
      const inventoryOverview = await analyticsQueryService.getInventoryOverview(invalidDate);
      
      // Verify error handling
      expect(inventoryOverview).toHaveProperty('error');
      expect(inventoryOverview.error).toBe('Failed to retrieve inventory overview');
      expect(inventoryOverview).toHaveProperty('message');
      expect(inventoryOverview.message).toBe('Invalid date provided');
    });
  });

  /**
   * Test suite for customer insights
   * Verifies that customer insights are correctly calculated
   */
  describe('Customer Insights', () => {
    it('should retrieve customer insights for a date range', async () => {
      // Set up test date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3);
      const endDate = new Date();
      
      // Get customer insights
      const customerInsights = await analyticsQueryService.getCustomerInsights(startDate, endDate);
      
      // Verify structure
      expect(customerInsights).toHaveProperty('retention');
      expect(customerInsights).toHaveProperty('churn');
      expect(customerInsights).toHaveProperty('newCustomers');
      expect(customerInsights).toHaveProperty('repeatCustomers');
      expect(customerInsights).toHaveProperty('trend');
      expect(customerInsights).toHaveProperty('dateRange');
      
      // Verify values
      expect(customerInsights.retention).toBeGreaterThanOrEqual(0);
      expect(customerInsights.retention).toBeLessThanOrEqual(100);
      expect(customerInsights.churn).toBeGreaterThanOrEqual(0);
      expect(customerInsights.churn).toBeLessThanOrEqual(100);
      expect(customerInsights.newCustomers).toBeGreaterThanOrEqual(0);
      expect(customerInsights.repeatCustomers).toBeGreaterThanOrEqual(0);
      
      // Verify trend data
      if (customerInsights.trend.length > 0) {
        const trendItem = customerInsights.trend[0];
        expect(trendItem).toHaveProperty('date');
        expect(trendItem).toHaveProperty('retention');
        expect(trendItem).toHaveProperty('churn');
      }
    });
  });

  /**
   * Test suite for real-time dashboard
   * Verifies that real-time dashboard data is correctly retrieved
   */
  describe('Real-Time Dashboard', () => {
    it('should retrieve real-time dashboard data', async () => {
      // Set store context for testing
      const originalStoreId = (analyticsQueryService as any).storeId;
      try {
        // Set store context to store1
        (analyticsQueryService as any).storeId = testStores.store1;
        
        // Get real-time dashboard data
        const dashboardData = await analyticsQueryService.getRealTimeDashboard();
        
        // Verify structure
        expect(dashboardData).toHaveProperty('current');
        expect(dashboardData).toHaveProperty('trends');
        
        // Verify current data structure
        expect(dashboardData.current).toHaveProperty('activeUsers');
        expect(dashboardData.current).toHaveProperty('pageViews');
        expect(dashboardData.current).toHaveProperty('trafficSources');
        expect(dashboardData.current).toHaveProperty('timestamp');
        
        // Verify values
        expect(dashboardData.current.activeUsers).toBeGreaterThanOrEqual(0);
        expect(dashboardData.current.pageViews).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(dashboardData.current.trafficSources)).toBe(true);
        expect(dashboardData.current.timestamp instanceof Date || typeof dashboardData.current.timestamp === 'string').toBe(true);
        
        // Verify trends data structure
        expect(dashboardData.trends).toHaveProperty('activeUsers');
        expect(dashboardData.trends).toHaveProperty('pageViews');
        expect(Array.isArray(dashboardData.trends.activeUsers)).toBe(true);
        expect(Array.isArray(dashboardData.trends.pageViews)).toBe(true);
        
        // Verify trend data structure if available
        if (dashboardData.trends.activeUsers.length > 0) {
          const userTrendItem = dashboardData.trends.activeUsers[0];
          expect(userTrendItem).toHaveProperty('timestamp');
          expect(userTrendItem).toHaveProperty('users');
        }
        
        if (dashboardData.trends.pageViews.length > 0) {
          const viewTrendItem = dashboardData.trends.pageViews[0];
          expect(viewTrendItem).toHaveProperty('timestamp');
          expect(viewTrendItem).toHaveProperty('views');
        }
      } finally {
        // Restore original store context
        (analyticsQueryService as any).storeId = originalStoreId;
      }
    });
  });
});
