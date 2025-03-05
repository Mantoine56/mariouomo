import { ApiError } from './api-client';
import { config } from './config';

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
 * Service for interacting with the development analytics API endpoints
 * Connects to backend/src/modules/analytics/controllers/analytics-dev.controller.ts
 * This is a non-authenticated version for development purposes only
 */
export class AnalyticsApiDev {
  /**
   * Make a GET request to the API without authentication
   * @param endpoint The API endpoint path
   * @param params Optional query parameters
   * @returns The response data
   * @throws ApiError if the request fails
   */
  private static async get<T>(endpoint: string, params?: Record<string, string | undefined>): Promise<T> {
    // Build URL with query parameters
    const url = new URL(`${config.api.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    try {
      // Make the request
      const response = await fetch(url.toString(), {
        headers: {
          ...config.api.defaultHeaders,
        },
      });
      
      // Handle non-successful responses
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Parsing error JSON failed, use default message
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse and return the response data
      return response.json();
    } catch (error) {
      // Rethrow API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }

  /**
   * Get sales analytics for a specified date range using dev endpoints
   * Connects to: GET /dev/analytics/sales in AnalyticsDevController
   * 
   * @param startDate The start date (optional)
   * @param endDate The end date (optional)
   * @returns Sales analytics data
   */
  static async getSales(startDate?: Date, endDate?: Date): Promise<SalesAnalytics> {
    return AnalyticsApiDev.get<SalesAnalytics>('/dev/analytics/sales', {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }
  
  /**
   * Get customer analytics for a specified date range using dev endpoints
   * Connects to: GET /dev/analytics/customers in AnalyticsDevController
   * 
   * @param startDate The start date (optional)
   * @param endDate The end date (optional)
   * @returns Customer analytics data
   */
  static async getCustomers(startDate?: Date, endDate?: Date): Promise<CustomerAnalytics> {
    return AnalyticsApiDev.get<CustomerAnalytics>('/dev/analytics/customers', {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }
  
  /**
   * Get product performance metrics for a specified date range using dev endpoints
   * Connects to: GET /dev/analytics/products/performance in AnalyticsDevController
   * 
   * @param startDate The start date (optional)
   * @param endDate The end date (optional)
   * @returns Product performance data
   */
  static async getProductPerformance(startDate?: Date, endDate?: Date): Promise<ProductPerformance> {
    return AnalyticsApiDev.get<ProductPerformance>('/dev/analytics/products/performance', {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }
  
  /**
   * Get category performance metrics for a specified date range using dev endpoints
   * Connects to: GET /dev/analytics/categories/performance in AnalyticsDevController
   * 
   * @param startDate The start date (optional)
   * @param endDate The end date (optional)
   * @returns Category performance data
   */
  static async getCategoryPerformance(startDate?: Date, endDate?: Date): Promise<CategoryPerformance> {
    return AnalyticsApiDev.get<CategoryPerformance>('/dev/analytics/categories/performance', {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }
}