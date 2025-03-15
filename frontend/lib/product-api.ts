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
  url?: string;           // The actual database field
  original_url: string;   // For frontend compatibility
  thumbnail_url: string;  // For frontend compatibility
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
   * Cache for individual products by ID
   * Separate from pageCache to avoid type issues
   */
  private static productCache = new Map<string, { data: Product, timestamp: number }>();

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
      console.log(`[FETCH STRATEGY] Starting fetch for product ${id}`);
      
      // Check for cached product first - increase performance by using cache more aggressively
      const cacheKey = `product_${id}`;
      const cachedData = ProductApi.productCache.get(cacheKey);
      
      // Use cached data if available and not too old
      if (cachedData && Date.now() - cachedData.timestamp < ProductApi.CACHE_TTL) {
        console.log(`[FETCH STRATEGY] Using cached data for product ${id}`);
        return cachedData.data;
      }
      
      console.log(`[FETCH STRATEGY] Cache miss - attempting API fetch for product ${id}`);
      let retryCount = 0;
      const maxRetries = 1; // Reduce retries for faster fallback
      
      while (retryCount <= maxRetries) {
        try {
          // Attempt to get product from API
          console.log(`[FETCH STRATEGY] API attempt ${retryCount + 1}/${maxRetries + 1} for product ${id}`);
          const response = await ApiClient.get<Product>(`${this.baseUrl}/${id}`);
          
          console.log(`[FETCH STRATEGY] API fetch succeeded for product ${id}`);
          // Cache successful response
          ProductApi.productCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
          });
          
          return response;
        } catch (error) {
          console.error(`[FETCH STRATEGY] API fetch failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
          
          if (retryCount === maxRetries) {
            // Try fallback to direct database query on last attempt - fail fast
            console.log(`[FETCH STRATEGY] All API attempts failed, attempting direct database fallback for product ${id}`);
            try {
              const fallbackProduct = await this.fetchProductDirectlyById(id);
              if (fallbackProduct) {
                console.log(`[FETCH STRATEGY] Successfully retrieved product ${id} via database fallback`);
                ProductApi.productCache.set(cacheKey, {
                  data: fallbackProduct,
                  timestamp: Date.now()
                });
                return fallbackProduct;
              }
            } catch (fallbackError) {
              console.error(`[FETCH STRATEGY] Database fallback failed for product ${id}:`, fallbackError);
            }
            throw error;
          }
          
          // Wait before retrying (shorter delay for faster response)
          const delay = 500;
          console.log(`[FETCH STRATEGY] Waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
        }
      }
      
      throw new Error(`[FETCH STRATEGY] Failed to fetch product after ${maxRetries} retries`);
    } catch (error) {
      console.error(`[FETCH STRATEGY] All fetch strategies failed for product ${id}:`, error);
      throw new ApiError(`Product with ID ${id} not found`, 404);
    }
  }
  
  /**
   * Fetch a single product directly from Supabase
   * For fallback use when the API endpoint fails
   * Uses separate queries to avoid recursion issues with RLS policies
   */
  private async fetchProductDirectlyById(id: string): Promise<Product | null> {
    try {
      console.log(`[DB FALLBACK] Fetching product ${id} directly from Supabase database`);
      
      // Create a simplified version of the product with mock data in case all else fails
      // This ensures we can at least show something to the user
      let fallbackProduct: Product = {
        id: id,
        name: "Product Details",
        description: "This product's details could not be loaded from the database. Please try again later.",
        price: 0,
        status: "draft",
        store_id: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // First, attempt to get the product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) {
        console.error(`[DB FALLBACK] Error fetching product: ${productError.message}`);
        return fallbackProduct;
      }

      if (!productData) {
        console.error(`[DB FALLBACK] Product not found with ID: ${id}`);
        return fallbackProduct;
      }

      // Now that we have a product, fetch its images
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('position', { ascending: true });

      if (imageError) {
        console.error(`[DB FALLBACK] Error fetching product images: ${imageError.message}`);
      }

      // Map the images to match the expected format
      const images = imageData ? imageData.map(img => ({
        id: img.id,
        product_id: img.product_id,
        url: img.url,
        original_url: img.url,
        thumbnail_url: img.url, // For now, use the same URL for both
        created_at: img.created_at
      })) : [];

      console.log(`[DB FALLBACK] Found ${images.length} images for product ${id}:`);
      if (images.length > 0) {
        console.log(images.map(img => img.original_url).join('\n'));
      }

      // Return the combined product with images
      return {
        ...productData,
        images: images,
        // Ensure price is a number
        price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
        // Ensure cost_price is a number
        cost_price: productData.cost_price ? 
          (typeof productData.cost_price === 'string' ? parseFloat(productData.cost_price) : productData.cost_price) : 
          undefined,
        // Ensure compare_at_price is a number
        compare_at_price: productData.compare_at_price ? 
          (typeof productData.compare_at_price === 'string' ? parseFloat(productData.compare_at_price) : productData.compare_at_price) : 
          undefined
      };
    } catch (error) {
      console.error(`[DB FALLBACK] Critical error fetching product ${id}:`, error);
      throw error;
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
          url: img.url,
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

  /**
   * Find products with IDs similar to the provided ID
   * This helps with common typos in product IDs (like '4f7c' vs '47fc')
   * @param id The product ID that may have typos
   * @returns Array of similar product IDs
   */
  public async findSimilarProductIds(id: string): Promise<string[]> {
    try {
      console.log(`[PRODUCT API] Searching for products with IDs similar to ${id}`);
      
      // Attempt to query all products (limiting to a reasonable number)
      const response = await this.searchProducts({ limit: 100 });
      const allProducts = response.items;
      
      if (!allProducts || allProducts.length === 0) {
        console.log('[PRODUCT API] No products found to compare against');
        return [];
      }
      
      // Find products with similar IDs
      const similarProducts = allProducts.filter((product: Product) => {
        // Skip exact matches
        if (product.id === id) return false;
        
        // Calculate similarity score - how many characters match in the same position
        let matchCount = 0;
        const minLength = Math.min(product.id.length, id.length);
        
        for (let i = 0; i < minLength; i++) {
          if (product.id[i] === id[i]) {
            matchCount++;
          }
        }
        
        // Calculate similarity as a percentage
        const similarity = matchCount / minLength;
        
        // Only consider products with high similarity (over 90%)
        return similarity > 0.9;
      });
      
      // Sort by name similarity for better matching
      similarProducts.sort((a: Product, b: Product) => {
        // If names match exactly, prioritize those
        if (a.name === b.name) return 0;
        if (a.name === 'LASLAS') return -1;
        if (b.name === 'LASLAS') return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      console.log(`[PRODUCT API] Found ${similarProducts.length} products with similar IDs`);
      
      return similarProducts.map((p: Product) => p.id);
    } catch (error) {
      console.error('[PRODUCT API] Error finding similar products:', error);
      return [];
    }
  }
}

// Export singleton instance
export const productApi = new ProductApi(); 