/**
 * Product API Service
 * 
 * Provides methods to interact with the product endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient, ApiError } from './api-client';
import { config } from './config';
import { supabase } from './supabase';

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
  // Metadata filtering for category and other metadata fields
  metadata?: {
    category?: string;
    [key: string]: any;
  };
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
   * Store for all products we've fetched so far - used for client-side pagination
   * since the API only returns the first page
   */
  private static cachedProducts: Product[] = [];
  private static lastFetchTime: number = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  /**
   * Cache for storing paginated responses by search parameters
   * This provides a more effective caching mechanism for different pages and filters
   */
  private static pageCache = new Map<string, { data: PaginatedResponse<Product>, timestamp: number }>();

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
      console.log('Fetching products with params:', params);
      
      // Build search query parameters
      // Format parameters according to what the backend expects
      const searchParams: Record<string, string> = {};
      
      // Backend expects these in a specific format - not as top-level parameters
      // They need to be properly formatted for NestJS's ValidationPipe
      
      // Add search parameters
      if (params.query) {
        // Ensure query is properly formatted and trimmed
        searchParams.query = params.query.trim();
        console.log(`Searching with query: "${searchParams.query}"`);
      }
      
      // Handle metadata filtering (like category)
      if (params.metadata) {
        // For category filtering using metadata
        if (params.metadata.category) {
          searchParams.metadata_category = params.metadata.category;
          console.log(`Filtering by category: ${params.metadata.category}`);
        }
        
        // Add other metadata filters if needed in the future
        // Following the same pattern of flattening the structure for API compatibility
      }
      
      if (params.status) {
        searchParams.status = params.status;
      }
      
      if (params.sortBy) {
        searchParams.sortBy = params.sortBy;
      }
      
      if (params.sortOrder) {
        searchParams.sortOrder = params.sortOrder;
      }
      
      // Pagination parameters
      if (params.page) {
        searchParams.page = params.page.toString();
      }
      
      if (params.limit) {
        searchParams.limit = params.limit.toString();
      }
      
      console.log('Using API compatible parameters:', searchParams);
      
      // We'll check if we have a cache key for this specific page
      const cacheKey = `products_${JSON.stringify(searchParams)}`;
      const cachedData = ProductApi.pageCache.get(cacheKey);
      const now = Date.now();
      const shouldRefresh = !cachedData || now - cachedData.timestamp > ProductApi.CACHE_TTL;
      
      if (shouldRefresh) {
        console.log('Cache is stale or empty, fetching fresh data from API');
        
        try {
          // Request the data from API with proper authentication
          const response = await ApiClient.get<PaginatedResponse<Product>>(this.baseUrl, searchParams);
          
          console.log('API Response:', response);
          
          // Get items and pagination data from response
          const items = response.items || [];
          const total = response.total || items.length;
          const apiPageCount = response.totalPages || Math.ceil(total / (params.limit || 10));
          
          // Create paginated response
          const paginatedResponse = {
            items: items,
            total: total,
            page: parseInt(searchParams.page || '1'),
            limit: parseInt(searchParams.limit || '10'),
            totalPages: apiPageCount,
            hasNextPage: parseInt(searchParams.page || '1') < apiPageCount,
            hasPreviousPage: parseInt(searchParams.page || '1') > 1
          };
          
          // Update cache for this specific page
          ProductApi.pageCache.set(cacheKey, {
            data: paginatedResponse,
            timestamp: now
          });
          
          console.log(`Updated cache for ${cacheKey} with ${items.length} products`);
          
          return paginatedResponse;
        } catch (error) {
          console.error('Error fetching from API:', error);
          // Return empty results but don't crash
          return {
            items: [],
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
      } else {
        console.log(`Using cached data for ${cacheKey}`);
        return cachedData.data;
      }
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw this.handleError(error, 'Failed to fetch products. Please check the database connection.');
    }
  }
  
  /**
   * Fetch products directly from the database using Supabase
   * This is a temporary solution until the API is fixed
   */
  private async fetchProductsDirectly(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    try {
      console.log('Fetching products directly from Supabase database');
      
      // Set up pagination parameters
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;
      
      // Start building the query
      let query = supabase
        .from('products')
        .select('*, product_variants(*), product_images(*)', { count: 'exact' });
      
      // Add filters based on params
      if (params.query) {
        query = query.ilike('name', `%${params.query}%`);
      }
      
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      if (params.minPrice !== undefined) {
        query = query.gte('price', params.minPrice);
      }
      
      if (params.maxPrice !== undefined) {
        query = query.lte('price', params.maxPrice);
      }
      
      // Add sorting
      if (params.sortBy) {
        const order = params.sortOrder === SortDirection.DESC ? true : false;
        query = query.order(params.sortBy, { ascending: !order });
      } else {
        // Default sort by created_at descending
        query = query.order('created_at', { ascending: false });
      }
      
      // Add pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: page > 1
        };
      }
      
      // Transform the data into the Product format
      const products: Product[] = data.map(item => {
        // Extract and transform variants
        const variants: ProductVariant[] = item.product_variants || [];
        
        // Extract and transform images
        const images: ProductImage[] = item.product_images?.map((img: any) => ({
          id: img.id,
          product_id: img.product_id,
          original_url: img.url,
          thumbnail_url: img.thumbnail_url || img.url,
          created_at: img.created_at
        })) || [];
        
        // Return the transformed product
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          compare_at_price: item.compare_at_price,
          cost_price: item.cost_price,
          status: item.status,
          store_id: item.store_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          metadata: item.metadata,
          variants,
          images
        };
      });
      
      // Calculate pagination values
      const totalCount = count || products.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        items: products,
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching products from database:', error);
      throw error;
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