import { ApiClient } from './api-client';

/**
 * Interface for Sales Analytics data from the backend
 * Matches the response from AnalyticsQueryService.getSalesOverview()
 */
export interface SalesAnalytics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_change_percentage: number;
  orders_change_percentage: number;
  daily_revenue: Array<{
    date: string;
    revenue: number;
  }>;
}

/**
 * Interface for Inventory Analytics data from the backend
 * Matches the response from AnalyticsQueryService.getInventoryOverview()
 */
export interface InventoryAnalytics {
  total_products: number;
  in_stock_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  inventory_value: number;
  top_low_stock_products: Array<{
    id: string;
    name: string;
    inventory: number;
    category: string;
  }>;
}

/**
 * Interface for Customer Analytics data from the backend
 * Matches the response from AnalyticsQueryService.getCustomerInsights()
 */
export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_growth_rate: number;
  average_customer_value: number;
  daily_acquisition: Array<{
    date: string;
    new_customers: number;
    returning_customers: number;
  }>;
}

/**
 * Interface for Real-time Dashboard data from the backend
 * Matches the response from RealTimeTrackingService.getCurrentMetrics()
 */
export interface RealTimeDashboard {
  active_users: number;
  active_sessions: number;
  cart_count: number;
  cart_value: number;
  pending_orders: number;
  conversion_rate: number;
  page_views: Array<{
    page: string;
    views: number;
    average_time: number;
  }>;
  traffic_sources: Array<{
    source: string;
    active_users: number;
    conversion_rate: number;
  }>;
}

/**
 * Interface for Product Performance data from the backend
 * Matches the response from AnalyticsQueryService.getProductPerformance()
 */
export interface ProductPerformance {
  products: Array<{
    id: string;
    name: string;
    category: string;
    revenue: number;
    orders: number;
    units_sold: number;
    return_rate: number;
  }>;
}

/**
 * Interface for Category Performance data from the backend
 * Matches the response from AnalyticsQueryService.getCategoryPerformance()
 */
export interface CategoryPerformance {
  categories: Array<{
    name: string;
    revenue: number;
    orders: number;
    products_count: number;
    revenue_percentage: number;
  }>;
}

/**
 * Interface for Traffic Source data from the backend
 * Matches the response from AnalyticsQueryService.getTrafficSourceDistribution()
 */
export interface TrafficSources {
  sources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
}

/**
 * Service for interacting with the analytics API endpoints
 * Connects to backend/src/modules/analytics/controllers/analytics.controller.ts
 */
export class AnalyticsApi {
  /**
   * Get sales analytics for a specified date range
   * Connects to: GET /analytics/sales in AnalyticsController
   * 
   * @param startDate The start date
   * @param endDate The end date
   * @returns Sales analytics data
   */
  static async getSales(startDate: Date, endDate: Date): Promise<SalesAnalytics> {
    return ApiClient.get<SalesAnalytics>('/analytics/sales', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
  
  /**
   * Get inventory analytics for a specific date
   * Connects to: GET /analytics/inventory in AnalyticsController
   * 
   * @param date The date for inventory data
   * @returns Inventory analytics data
   */
  static async getInventory(date: Date): Promise<InventoryAnalytics> {
    return ApiClient.get<InventoryAnalytics>('/analytics/inventory', {
      date: date.toISOString(),
    });
  }
  
  /**
   * Get customer analytics for a specified date range
   * Connects to: GET /analytics/customers in AnalyticsController
   * 
   * @param startDate The start date
   * @param endDate The end date
   * @returns Customer analytics data
   */
  static async getCustomers(startDate: Date, endDate: Date): Promise<CustomerAnalytics> {
    return ApiClient.get<CustomerAnalytics>('/analytics/customers', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
  
  /**
   * Get real-time dashboard data
   * Connects to: GET /analytics/realtime/dashboard in AnalyticsController
   * 
   * @returns Real-time dashboard metrics
   */
  static async getRealTimeDashboard(): Promise<RealTimeDashboard> {
    return ApiClient.get<RealTimeDashboard>('/analytics/realtime/dashboard');
  }
  
  /**
   * Get product performance metrics for a specified date range
   * Connects to: GET /analytics/products/performance in AnalyticsController
   * 
   * @param startDate The start date
   * @param endDate The end date
   * @returns Product performance data
   */
  static async getProductPerformance(startDate: Date, endDate: Date): Promise<ProductPerformance> {
    return ApiClient.get<ProductPerformance>('/analytics/products/performance', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
  
  /**
   * Get category performance metrics for a specified date range
   * Connects to: GET /analytics/categories/performance in AnalyticsController
   * 
   * @param startDate The start date
   * @param endDate The end date
   * @returns Category performance data
   */
  static async getCategoryPerformance(startDate: Date, endDate: Date): Promise<CategoryPerformance> {
    return ApiClient.get<CategoryPerformance>('/analytics/categories/performance', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
  
  /**
   * Get traffic source distribution
   * Connects to: GET /analytics/traffic-sources in AnalyticsController
   * 
   * @returns Traffic source data
   */
  static async getTrafficSources(): Promise<TrafficSources> {
    return ApiClient.get<TrafficSources>('/analytics/traffic-sources');
  }
  
  /**
   * Get active user count
   * Connects to: GET /analytics/active-users in AnalyticsController
   * 
   * @returns Active user count
   */
  static async getActiveUsers(): Promise<{ count: number }> {
    return ApiClient.get<{ count: number }>('/analytics/active-users');
  }
  
  /**
   * Get page view counts
   * Connects to: GET /analytics/page-views in AnalyticsController
   * 
   * @returns Page view counts
   */
  static async getPageViews(): Promise<{ pages: Array<{ page: string; views: number }> }> {
    return ApiClient.get<{ pages: Array<{ page: string; views: number }> }>('/analytics/page-views');
  }
} 