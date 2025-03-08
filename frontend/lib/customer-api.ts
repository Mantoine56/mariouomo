/**
 * Customer API Service
 * 
 * Provides methods to interact with the customer endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient, ApiError } from './api-client';

/**
 * Customer interface - matches backend Customer entity structure
 */
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  notes?: string;
  status: 'active' | 'inactive';
  addresses?: CustomerAddress[];
}

/**
 * Customer address interface
 */
export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
  created_at: string;
  updated_at: string;
}

/**
 * Customer search parameters interface
 */
export interface CustomerSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
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
 * CustomerApi class for interacting with customer endpoints
 */
export class CustomerApi {
  private baseUrl: string;

  /**
   * Constructor initializes the base URL
   */
  constructor() {
    this.baseUrl = `/customers`;
  }

  /**
   * Get a single customer by ID
   * @param id Customer UUID
   * @returns Promise resolving to a Customer
   */
  public async getCustomer(id: string): Promise<Customer> {
    try {
      const response = await ApiClient.get<Customer>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch customer');
    }
  }

  /**
   * Search customers with filtering and pagination
   * @param params Search parameters
   * @returns Promise resolving to a paginated list of customers
   */
  public async searchCustomers(params: CustomerSearchParams = {}): Promise<PaginatedResponse<Customer>> {
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      
      // Add pagination params
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      
      // Add search params
      if (params.query) queryParams.query = params.query;
      if (params.status) queryParams.status = params.status;
      if (params.minSpent !== undefined) queryParams.minSpent = params.minSpent.toString();
      if (params.maxSpent !== undefined) queryParams.maxSpent = params.maxSpent.toString();
      if (params.minOrders !== undefined) queryParams.minOrders = params.minOrders.toString();
      if (params.maxOrders !== undefined) queryParams.maxOrders = params.maxOrders.toString();
      
      // Add sort params
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortDirection = params.sortOrder;
      
      const response = await ApiClient.get<PaginatedResponse<Customer>>(this.baseUrl, queryParams);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search customers');
    }
  }

  /**
   * Create a new customer
   * @param customer Customer data
   * @returns Promise resolving to the created Customer
   */
  public async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_orders' | 'total_spent' | 'last_order_date'>): Promise<Customer> {
    try {
      const response = await ApiClient.post<Customer>(this.baseUrl, customer);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create customer');
    }
  }

  /**
   * Update an existing customer
   * @param id Customer UUID
   * @param customer Updated customer data
   * @returns Promise resolving to the updated Customer
   */
  public async updateCustomer(
    id: string, 
    customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_orders' | 'total_spent' | 'last_order_date'>>
  ): Promise<Customer> {
    try {
      // Use proper PUT method instead of POST with _method parameter
      const response = await ApiClient.put<Customer>(`${this.baseUrl}/${id}`, customer);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update customer');
    }
  }

  /**
   * Delete a customer
   * @param id Customer UUID
   * @returns Promise that resolves when the customer is deleted
   */
  public async deleteCustomer(id: string): Promise<void> {
    try {
      // Use proper DELETE method
      await ApiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete customer');
    }
  }

  /**
   * Add an address to a customer
   * @param customerId Customer UUID
   * @param address Address data
   * @returns Promise resolving to the created address
   */
  public async addCustomerAddress(
    customerId: string,
    address: Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>
  ): Promise<CustomerAddress> {
    try {
      const response = await ApiClient.post<CustomerAddress>(`${this.baseUrl}/${customerId}/addresses`, address);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to add customer address');
    }
  }

  /**
   * Update a customer address
   * @param customerId Customer UUID
   * @param addressId Address UUID
   * @param address Updated address data
   * @returns Promise resolving to the updated address
   */
  public async updateCustomerAddress(
    customerId: string,
    addressId: string,
    address: Partial<Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>
  ): Promise<CustomerAddress> {
    try {
      // Use proper PUT method
      const response = await ApiClient.put<CustomerAddress>(
        `${this.baseUrl}/${customerId}/addresses/${addressId}`,
        address
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update customer address');
    }
  }

  /**
   * Delete a customer address
   * @param customerId Customer UUID
   * @param addressId Address UUID
   * @returns Promise that resolves when the address is deleted
   */
  public async deleteCustomerAddress(customerId: string, addressId: string): Promise<void> {
    try {
      // Use proper DELETE method
      await ApiClient.delete(`${this.baseUrl}/${customerId}/addresses/${addressId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete customer address');
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
export const customerApi = new CustomerApi(); 