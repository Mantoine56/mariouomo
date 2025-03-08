/**
 * Order API Service
 * 
 * Provides methods to interact with the order endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient, ApiError } from './api-client';

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Order interface - matches backend Order entity structure
 */
export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  notes?: string;
  shipping_address_id: string;
  billing_address_id?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  shipping_address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_variant_name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Order search parameters interface
 */
export interface OrderSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  // Additional date fields for different API formats
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * OrderApi class for interacting with order endpoints
 */
export class OrderApi {
  private baseUrl: string;

  /**
   * Constructor initializes the base URL
   */
  constructor() {
    this.baseUrl = `/orders`;
  }

  /**
   * Get a single order by ID
   * @param id Order UUID
   * @returns Promise resolving to an Order
   */
  public async getOrder(id: string): Promise<Order> {
    try {
      const response = await ApiClient.get<Order>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch order');
    }
  }

  /**
   * Search orders with filtering and pagination
   * @param params Search parameters
   * @returns Promise resolving to a paginated list of orders
   */
  public async searchOrders(params: OrderSearchParams = {}): Promise<PaginatedResponse<Order>> {
    try {
      const queryParams: Record<string, string> = {};
      
      // Add pagination params
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.page) queryParams.page = params.page.toString();
      
      // Add filter params
      if (params.status) queryParams.status = params.status;
      if (params.customerId) queryParams.customerId = params.customerId;
      
      // Handle date parameters - support both formats
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      
      // Handle Date objects if provided
      if (params.fromDate instanceof Date) {
        queryParams.fromDate = params.fromDate.toISOString().split('T')[0];
      }
      if (params.toDate instanceof Date) {
        queryParams.toDate = params.toDate.toISOString().split('T')[0];
      }
      
      // Add sort params
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortDirection = params.sortOrder;
      
      // Make authenticated request to the orders endpoint
      const response = await ApiClient.get<PaginatedResponse<Order>>(this.baseUrl, queryParams);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search orders');
    }
  }

  /**
   * Create a new order
   * @param order Order data
   * @returns Promise resolving to the created Order
   */
  public async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    try {
      const response = await ApiClient.post<Order>(this.baseUrl, order);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create order');
    }
  }

  /**
   * Update an existing order
   * @param id Order UUID
   * @param order Updated order data
   * @returns Promise resolving to the updated Order
   */
  public async updateOrder(
    id: string, 
    order: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Order> {
    try {
      // Use proper PUT method instead of POST with _method parameter
      const response = await ApiClient.put<Order>(`${this.baseUrl}/${id}`, order);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update order');
    }
  }

  /**
   * Cancel an order
   * @param id Order UUID
   * @param reason Optional cancellation reason
   * @returns Promise resolving to the updated Order
   */
  public async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      const response = await ApiClient.post<Order>(`${this.baseUrl}/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to cancel order');
    }
  }

  /**
   * Update order status
   * @param id Order UUID
   * @param status New order status
   * @param notes Optional notes about the status change
   * @returns Promise resolving to the updated Order
   */
  public async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    try {
      const response = await ApiClient.post<Order>(`${this.baseUrl}/${id}/status`, { status, notes });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update order status');
    }
  }

  /**
   * Update payment status
   * @param id Order UUID
   * @param paymentStatus New payment status
   * @param transactionId Optional payment transaction ID
   * @returns Promise resolving to the updated Order
   */
  public async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<Order> {
    try {
      const response = await ApiClient.post<Order>(`${this.baseUrl}/${id}/payment`, { 
        paymentStatus, 
        transactionId 
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update payment status');
    }
  }

  /**
   * Handles errors from API requests
   * @param error The caught error
   * @param defaultMessage Default error message
   * @returns An ApiError
   */
  private handleError(error: unknown, defaultMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new ApiError(error.message, 500);
    }
    
    return new ApiError(defaultMessage, 500);
  }
}

// Export singleton instance
export const orderApi = new OrderApi(); 