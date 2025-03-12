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
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  status: string;
  store_id: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    type?: string;
    category?: string;
    tags?: string[];
    weight?: number;
    featured?: boolean;
    dimensions?: {
      unit: string;
      width: number;
      height: number;
      length: number;
    };
  };
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
    this.baseUrl = '/products';
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
      console.log('Fetching products from database with admin role');
      
      // Build search query parameters
      const searchParams: Record<string, string> = {};
      
      // Only add parameters that backend accepts
      // Note: Even though 'query' is in the DTO, it's getting rejected with "property query should not exist"
      // Therefore we'll avoid sending it
      if (params.storeId) searchParams.storeId = params.storeId;
      if (params.minPrice !== undefined) searchParams.minPrice = params.minPrice.toString();
      if (params.maxPrice !== undefined) searchParams.maxPrice = params.maxPrice.toString();
      
      // Add sort params
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      
      // Add categories if present
      if (params.categories && params.categories.length > 0) {
        searchParams.categories = params.categories.join(',');
      }
      
      // Add status filter if present
      if (params.status) {
        searchParams.status = params.status;
      }
      
      console.log('Sending query params to backend:', searchParams);
      
      // Make the API request
      try {
        const response = await ApiClient.get<any>(this.baseUrl, searchParams);
        
        console.log('Response from backend:', response);
        
        // If query parameter was provided, filter results on client side
        // This is a workaround since the server isn't accepting the query parameter
        let filteredItems = response.items || response;
        
        if (params.query && params.query.trim() !== '') {
          const searchTerm = params.query.toLowerCase();
          filteredItems = filteredItems.filter((product: Product) => {
            return (
              (product.name && product.name.toLowerCase().includes(searchTerm)) || 
              (product.description && product.description.toLowerCase().includes(searchTerm)) ||
              (product.metadata?.category && product.metadata.category.toLowerCase().includes(searchTerm)) ||
              (product.metadata?.tags && product.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
          });
        }
        
        // Map the response to the expected format
        const paginatedResponse: PaginatedResponse<Product> = {
          items: filteredItems,
          total: response.total || (response.length || 0),
          page: response.page || params.page || 1,
          limit: response.limit || params.limit || 10,
          totalPages: response.totalPages || Math.ceil((response.total || response.length || 0) / (params.limit || 10)),
          hasNextPage: response.hasNextPage || false,
          hasPreviousPage: response.hasPreviousPage || false,
        };
        
        return paginatedResponse;
      } catch (error: any) {
        console.error('API request error:', error);
        
        // Extract detailed error info if available
        let errorMessage = 'Failed to fetch products. Please try again.';
        let errorDetails = '';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          errorDetails = JSON.stringify(error);
        }
        
        if (error.response) {
          errorDetails += ` Status: ${error.response.status}`;
          
          if (error.response.data) {
            errorDetails += ` Data: ${JSON.stringify(error.response.data)}`;
          }
        }
        
        console.error(`API Error Details: ${errorDetails}`);
        
        // Create ApiError with appropriate status code
        const statusCode = error.statusCode || (error.response ? error.response.status : 500);
        throw new ApiError(`${errorMessage} (${errorDetails})`, statusCode);
      }
    } catch (error) {
      console.error('Error fetching products from database:', error);
      // Do not fall back to mock data, re-throw the error
      throw this.handleError(error, 'Failed to fetch products. Please try again.');
    }
  }
  
  /**
   * Fetch products directly from the database
   * This method is no longer used - all requests should go through the API
   * @deprecated Use searchProducts instead
   */
  private async fetchProductsFromDatabase(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    throw new Error('fetchProductsFromDatabase is deprecated. Use searchProducts instead.');
  }
  
  /**
   * Mock product response with hardcoded data
   * This method is no longer used - all requests should go through the API
   * @deprecated Never use mock data in production
   */
  private async mockProductsResponse(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    throw new Error('mockProductsResponse is deprecated. Never use mock data in production.');
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
      // Use proper PUT method instead of POST with _method parameter
      const response = await ApiClient.put<Product>(`${this.baseUrl}/${id}`, product);
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
      // Use proper DELETE method
      await ApiClient.delete(`${this.baseUrl}/${id}`);
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
      // Use proper DELETE method
      await ApiClient.delete(`${this.baseUrl}/${productId}/images/${imageId}`);
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