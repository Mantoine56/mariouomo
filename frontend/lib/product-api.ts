/**
 * Product API Service
 * 
 * Provides methods to interact with the product endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient, ApiError } from './api-client';
import { config } from './config';

/**
 * Product status enum matching backend values
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Sort fields for products
 */
export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

/**
 * Sort direction options
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Product interface - matches backend Product entity structure
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  status: ProductStatus;
  type?: string;
  store_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

/**
 * Product variant interface
 */
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price_adjustment: number;
  weight?: number;
  current_stock: number;
  product_id: string;
}

/**
 * Product image interface
 */
export interface ProductImage {
  id: string;
  product_id: string;
  original_url: string;
  thumbnail_url: string;
  created_at: string;
}

/**
 * Product search parameters interface
 */
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  storeId?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortField;
  sortOrder?: SortDirection;
  status?: string;
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
 * ProductApi class for interacting with product endpoints
 */
export class ProductApi {
  private baseUrl: string;

  /**
   * Constructor initializes the base URL
   */
  constructor() {
    this.baseUrl = `/products`;
  }

  /**
   * Get a single product by ID
   * @param id Product UUID
   * @returns Promise resolving to a Product
   */
  public async getProduct(id: string): Promise<Product> {
    try {
      const response = await ApiClient.get<Product>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch product');
    }
  }

  /**
   * Search products with filtering and pagination
   * @param params Search parameters
   * @returns Promise resolving to a paginated list of products
   */
  public async searchProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      
      // Add pagination params
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      
      // Add search params
      if (params.query) queryParams.query = params.query;
      if (params.storeId) queryParams.storeId = params.storeId;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice.toString();
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice.toString();
      
      // Add sort params
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortDirection = params.sortOrder;
      
      // Add categories if present (as comma-separated string)
      if (params.categories && params.categories.length > 0) {
        queryParams.categories = params.categories.join(',');
      }
      
      const response = await ApiClient.get<PaginatedResponse<Product>>(this.baseUrl, queryParams);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search products');
    }
  }

  /**
   * Create a new product
   * @param product Product data
   * @returns Promise resolving to the created Product
   */
  public async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const response = await ApiClient.post<Product>(this.baseUrl, product);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create product');
    }
  }

  /**
   * Update an existing product
   * @param id Product UUID
   * @param product Updated product data
   * @returns Promise resolving to the updated Product
   */
  public async updateProduct(
    id: string, 
    product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Product> {
    try {
      // Since ApiClient doesn't have a PUT method, we'll use POST with a _method parameter
      // to indicate this should be a PUT request on the backend
      const response = await ApiClient.post<Product>(`${this.baseUrl}/${id}`, {
        ...product,
        _method: 'PUT'
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update product');
    }
  }

  /**
   * Delete a product
   * @param id Product UUID
   * @returns Promise that resolves when the product is deleted
   */
  public async deleteProduct(id: string): Promise<void> {
    try {
      // Since ApiClient doesn't have a DELETE method, we'll use POST with a _method parameter
      // to indicate this should be a DELETE request on the backend
      await ApiClient.post<void>(`${this.baseUrl}/${id}`, {
        _method: 'DELETE'
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to delete product');
    }
  }

  /**
   * Add an image to a product
   * @param productId Product UUID
   * @param imageData Image data
   * @returns Promise that resolves when the image is added
   */
  public async addProductImage(
    productId: string,
    imageData: { originalUrl: string; thumbnailUrl: string }
  ): Promise<void> {
    try {
      await ApiClient.post<void>(`${this.baseUrl}/${productId}/images`, imageData);
    } catch (error) {
      throw this.handleError(error, 'Failed to add product image');
    }
  }

  /**
   * Remove an image from a product
   * @param productId Product UUID
   * @param imageId Image UUID
   * @returns Promise that resolves when the image is removed
   */
  public async removeProductImage(productId: string, imageId: string): Promise<void> {
    try {
      // Since ApiClient doesn't have a DELETE method, we'll use POST with a _method parameter
      await ApiClient.post<void>(`${this.baseUrl}/${productId}/images/${imageId}`, {
        _method: 'DELETE'
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to remove product image');
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
export const productApi = new ProductApi(); 