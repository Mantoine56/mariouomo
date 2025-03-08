import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { AnalyticsQueryService } from '../../../src/modules/analytics/services/analytics-query.service';
import { RealTimeTrackingService } from '../../../src/modules/analytics/services/real-time-tracking.service';
import { SalesMetrics } from '../../../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../../../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../../../src/modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../../../src/modules/analytics/entities/real-time-metrics.entity';

/**
 * Integration tests for Multi-Tenant Analytics
 * 
 * These tests verify that:
 * 1. Analytics data is properly isolated between stores
 * 2. Each store can only access its own data
 * 3. Multi-tenant analytics queries return correct data for each store
 * 4. Real-time tracking properly isolates data between stores
 */
describe('Multi-Tenant Analytics Integration Tests', () => {
  let app: INestApplication;
  let analyticsQueryService: AnalyticsQueryService;
  let realTimeTrackingService: RealTimeTrackingService;
  let salesMetricsRepository: Repository<SalesMetrics>;
  let inventoryMetricsRepository: Repository<InventoryMetrics>;
  let customerMetricsRepository: Repository<CustomerMetrics>;
  let realTimeMetricsRepository: Repository<RealTimeMetrics>;
  let dataSource: DataSource;
  
  // Test store IDs
  const testStores = {
    store1: uuidv4(),
    store2: uuidv4(),
    store3: uuidv4(),
  };
  
  // Test session IDs
  const testSessions = {
    store1Session1: uuidv4(),
    store1Session2: uuidv4(),
    store2Session1: uuidv4(),
    store3Session1: uuidv4(),
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
    realTimeTrackingService = moduleFixture.get<RealTimeTrackingService>(RealTimeTrackingService);
    salesMetricsRepository = moduleFixture.get<Repository<SalesMetrics>>(getRepositoryToken(SalesMetrics));
    inventoryMetricsRepository = moduleFixture.get<Repository<InventoryMetrics>>(getRepositoryToken(InventoryMetrics));
    customerMetricsRepository = moduleFixture.get<Repository<CustomerMetrics>>(getRepositoryToken(CustomerMetrics));
    realTimeMetricsRepository = moduleFixture.get<Repository<RealTimeMetrics>>(getRepositoryToken(RealTimeMetrics));
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean up any existing test data
    await cleanupTestData();
    
    // Seed test data for multiple stores
    await seedMultiTenantTestData();
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
      // Delete test sales metrics for all test stores
      await manager.delete(SalesMetrics, {
        store_id: [testStores.store1, testStores.store2, testStores.store3],
      });
      
      // Delete test inventory metrics for all test stores
      await manager.delete(InventoryMetrics, {
        store_id: [testStores.store1, testStores.store2, testStores.store3],
      });
      
      // Delete test customer metrics for all test stores
      await manager.delete(CustomerMetrics, {
        store_id: [testStores.store1, testStores.store2, testStores.store3],
      });
      
      // Delete test real-time metrics for all test stores
      await manager.delete(RealTimeMetrics, {
        store_id: [testStores.store1, testStores.store2, testStores.store3],
      });
    });
  }

  /**
   * Seed test data for multiple stores to test multi-tenant isolation
   * Creates distinct data sets for each test store
   */
  async function seedMultiTenantTestData() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await dataSource.transaction(async (manager) => {
      // Seed sales metrics for multiple stores
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
        // Store 2 - Today (different values)
        {
          id: uuidv4(),
          store_id: testStores.store2,
          date: now,
          total_revenue: 2000,
          total_orders: 20,
          average_order_value: 100,
          views: 400,
          product_id: 'product-1',
        },
        // Store 3 - Today (different values)
        {
          id: uuidv4(),
          store_id: testStores.store3,
          date: now,
          total_revenue: 3000,
          total_orders: 30,
          average_order_value: 100,
          views: 600,
          product_id: 'product-1',
        },
      ];
      
      for (const metric of salesMetrics) {
        await manager.save(SalesMetrics, metric);
      }
      
      // Seed inventory metrics for multiple stores
      const inventoryMetrics = [
        // Store 1 - Today
        {
          id: uuidv4(),
          store_id: testStores.store1,
          date: now,
          total_sku_count: 100,
          low_stock_items: 10,
          out_of_stock_items: 5,
          turnover_rate: 0.2,
        },
        // Store 2 - Today (different values)
        {
          id: uuidv4(),
          store_id: testStores.store2,
          date: now,
          total_sku_count: 200,
          low_stock_items: 20,
          out_of_stock_items: 10,
          turnover_rate: 0.3,
        },
        // Store 3 - Today (different values)
        {
          id: uuidv4(),
          store_id: testStores.store3,
          date: now,
          total_sku_count: 300,
          low_stock_items: 30,
          out_of_stock_items: 15,
          turnover_rate: 0.4,
        },
      ];
      
      for (const metric of inventoryMetrics) {
        await manager.save(InventoryMetrics, metric);
      }
      
      // Seed customer metrics for multiple stores
      const customerMetrics = [
        // Store 1 - Today
        {
          id: uuidv4(),
          store_id: testStores.store1,
          created_at: now,
          last_purchase_date: now,
          traffic_source: 'google',
        },
        // Store 1 - Another customer
        {
          id: uuidv4(),
          store_id: testStores.store1,
          created_at: yesterday,
          last_purchase_date: yesterday,
          traffic_source: 'direct',
        },
        // Store 2 - Today (different source)
        {
          id: uuidv4(),
          store_id: testStores.store2,
          created_at: now,
          last_purchase_date: now,
          traffic_source: 'social',
        },
        // Store 3 - Today (different source)
        {
          id: uuidv4(),
          store_id: testStores.store3,
          created_at: now,
          last_purchase_date: now,
          traffic_source: 'referral',
        },
      ];
      
      for (const metric of customerMetrics) {
        await manager.save(CustomerMetrics, metric);
      }
      
      // Seed real-time metrics for multiple stores
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
          ],
          traffic_sources: [
            { source: 'google', count: 20 },
            { source: 'direct', count: 15 },
          ],
        },
        // Store 2 - Now (different values)
        {
          id: uuidv4(),
          store_id: testStores.store2,
          timestamp: new Date(),
          active_users: 50,
          active_sessions: 60,
          cart_count: 15,
          cart_value: 1500,
          page_views: [
            { page: 'home', views: 100 },
            { page: 'products', views: 60 },
          ],
          traffic_sources: [
            { source: 'social', count: 40 },
            { source: 'email', count: 30 },
          ],
        },
        // Store 3 - Now (different values)
        {
          id: uuidv4(),
          store_id: testStores.store3,
          timestamp: new Date(),
          active_users: 75,
          active_sessions: 90,
          cart_count: 25,
          cart_value: 2500,
          page_views: [
            { page: 'home', views: 150 },
            { page: 'products', views: 90 },
          ],
          traffic_sources: [
            { source: 'referral', count: 60 },
            { source: 'affiliate', count: 45 },
          ],
        },
      ];
      
      for (const metric of realTimeMetrics) {
        await manager.save(RealTimeMetrics, metric);
      }
    });
  }

  /**
   * Test suite for multi-tenant sales analytics
   * Verifies that sales data is properly isolated between stores
   */
  describe('Multi-Tenant Sales Analytics', () => {
    it('should retrieve isolated sales data for each store', async () => {
      // Set up test date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3);
      const endDate = new Date();
      
      // Get sales data for each store with date range filtering
      const store1Sales = await salesMetricsRepository.find({
        where: {
          store_id: testStores.store1,
          date: Between(startDate, endDate)
        },
      });
      
      const store2Sales = await salesMetricsRepository.find({
        where: {
          store_id: testStores.store2,
          date: Between(startDate, endDate)
        },
      });
      
      const store3Sales = await salesMetricsRepository.find({
        where: {
          store_id: testStores.store3,
          date: Between(startDate, endDate)
        },
      });
      
      // Verify data isolation
      expect(store1Sales.length).toBeGreaterThan(0);
      expect(store2Sales.length).toBeGreaterThan(0);
      expect(store3Sales.length).toBeGreaterThan(0);
      
      // Verify store1 data is different from store2 and store3
      expect(store1Sales[0].total_revenue).not.toBe(store2Sales[0].total_revenue);
      expect(store1Sales[0].total_revenue).not.toBe(store3Sales[0].total_revenue);
      
      // Verify store2 data is different from store3
      expect(store2Sales[0].total_revenue).not.toBe(store3Sales[0].total_revenue);
    });
    
    it('should apply store context to analytics queries', async () => {
      // Mock the store context for testing
      // This would normally be set by the authentication system
      const originalStoreId = (analyticsQueryService as any).storeId;
      
      try {
        // Set store context to store1
        (analyticsQueryService as any).storeId = testStores.store1;
        
        // Set up test date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 3);
        const endDate = new Date();
        
        // Get sales overview for store1
        const store1SalesOverview = await analyticsQueryService.getSalesOverview(startDate, endDate);
        
        // Change store context to store2
        (analyticsQueryService as any).storeId = testStores.store2;
        
        // Get sales overview for store2
        const store2SalesOverview = await analyticsQueryService.getSalesOverview(startDate, endDate);
        
        // Verify different results for different stores
        expect(store1SalesOverview.revenue).not.toBe(store2SalesOverview.revenue);
        expect(store1SalesOverview.orders).not.toBe(store2SalesOverview.orders);
      } finally {
        // Restore original store context
        (analyticsQueryService as any).storeId = originalStoreId;
      }
    });
  });

  /**
   * Test suite for multi-tenant inventory analytics
   * Verifies that inventory data is properly isolated between stores
   */
  describe('Multi-Tenant Inventory Analytics', () => {
    it('should retrieve isolated inventory data for each store', async () => {
      // Get inventory data for each store
      const store1Inventory = await inventoryMetricsRepository.find({
        where: { store_id: testStores.store1 },
      });
      
      const store2Inventory = await inventoryMetricsRepository.find({
        where: { store_id: testStores.store2 },
      });
      
      const store3Inventory = await inventoryMetricsRepository.find({
        where: { store_id: testStores.store3 },
      });
      
      // Verify data isolation
      expect(store1Inventory.length).toBeGreaterThan(0);
      expect(store2Inventory.length).toBeGreaterThan(0);
      expect(store3Inventory.length).toBeGreaterThan(0);
      
      // Verify store1 data is different from store2 and store3
      expect(store1Inventory[0].total_sku_count).not.toBe(store2Inventory[0].total_sku_count);
      expect(store1Inventory[0].total_sku_count).not.toBe(store3Inventory[0].total_sku_count);
      
      // Verify store2 data is different from store3
      expect(store2Inventory[0].total_sku_count).not.toBe(store3Inventory[0].total_sku_count);
    });
  });

  /**
   * Test suite for multi-tenant customer analytics
   * Verifies that customer data is properly isolated between stores
   */
  describe('Multi-Tenant Customer Analytics', () => {
    it('should retrieve isolated customer data for each store', async () => {
      // Get customer data for each store
      const store1Customers = await customerMetricsRepository.find({
        where: { store_id: testStores.store1 },
      });
      
      const store2Customers = await customerMetricsRepository.find({
        where: { store_id: testStores.store2 },
      });
      
      const store3Customers = await customerMetricsRepository.find({
        where: { store_id: testStores.store3 },
      });
      
      // Verify data isolation
      expect(store1Customers.length).toBeGreaterThan(0);
      expect(store2Customers.length).toBeGreaterThan(0);
      expect(store3Customers.length).toBeGreaterThan(0);
      
      // Verify store1 has different traffic sources than store2 and store3
      expect(store1Customers[0].traffic_source).not.toBe(store2Customers[0].traffic_source);
      expect(store1Customers[0].traffic_source).not.toBe(store3Customers[0].traffic_source);
      
      // Verify store2 has different traffic sources than store3
      expect(store2Customers[0].traffic_source).not.toBe(store3Customers[0].traffic_source);
    });
  });

  /**
   * Test suite for multi-tenant real-time analytics
   * Verifies that real-time data is properly isolated between stores
   */
  describe('Multi-Tenant Real-Time Analytics', () => {
    it('should retrieve isolated real-time data for each store', async () => {
      // Get real-time data for each store
      const store1RealTime = await realTimeMetricsRepository.find({
        where: { store_id: testStores.store1 },
      });
      
      const store2RealTime = await realTimeMetricsRepository.find({
        where: { store_id: testStores.store2 },
      });
      
      const store3RealTime = await realTimeMetricsRepository.find({
        where: { store_id: testStores.store3 },
      });
      
      // Verify data isolation
      expect(store1RealTime.length).toBeGreaterThan(0);
      expect(store2RealTime.length).toBeGreaterThan(0);
      expect(store3RealTime.length).toBeGreaterThan(0);
      
      // Verify store1 data is different from store2 and store3
      expect(store1RealTime[0].active_users).not.toBe(store2RealTime[0].active_users);
      expect(store1RealTime[0].active_users).not.toBe(store3RealTime[0].active_users);
      
      // Verify store2 data is different from store3
      expect(store2RealTime[0].active_users).not.toBe(store3RealTime[0].active_users);
    });
    
    it('should track user activity with store isolation', async () => {
      // Mock the store context for testing
      const originalStoreId = (realTimeTrackingService as any).storeId;
      
      try {
        // Set store context to store1
        (realTimeTrackingService as any).storeId = testStores.store1;
        
        // Track activity for store1
        await realTimeTrackingService.trackUserActivity('user1', testSessions.store1Session1);
        await realTimeTrackingService.trackUserActivity('user2', testSessions.store1Session2);
        
        // Get active user count for store1
        const store1ActiveUsers = realTimeTrackingService.getActiveUserCount();
        
        // Change store context to store2
        (realTimeTrackingService as any).storeId = testStores.store2;
        
        // Track activity for store2
        await realTimeTrackingService.trackUserActivity('user3', testSessions.store2Session1);
        
        // Get active user count for store2
        const store2ActiveUsers = realTimeTrackingService.getActiveUserCount();
        
        // Verify different active user counts for different stores
        expect(store1ActiveUsers).not.toBe(store2ActiveUsers);
      } finally {
        // Restore original store context
        (realTimeTrackingService as any).storeId = originalStoreId;
      }
    });
  });
});
