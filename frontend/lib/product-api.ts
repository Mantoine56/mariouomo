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
    inventory?: string | number;
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
  alt?: string;           // Alt text for the image
  position?: number;      // Position for ordering
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
 * Inventory item interface
 */
export interface InventoryItem {
  id: string;
  variant_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  location: string;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Extended product variant interface with inventory data
 */
export interface ProductVariantWithInventory {
  // Include all properties from ProductVariant
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  price: number;
  compare_at_price?: number;
  position?: number;
  option_values?: Record<string, string>;
  created_at: string;
  updated_at: string;
  
  // Additional inventory properties
  inventory?: InventoryItem[];
  total_quantity?: number;
  available_quantity?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
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
   * @param id Product UUID (can include query parameters for cache busting)
   * @returns Promise resolving to a Product
   */
  public async getProduct(id: string): Promise<Product> {
    try {
      // Extract the base ID without any query parameters
      const baseId = id.split('?')[0];
      console.log(`[FETCH STRATEGY] Starting fetch for product ${baseId}`);
      
      // Check for cached product first - increase performance by using cache more aggressively
      const cacheKey = `product_${baseId}`;
      const cachedData = ProductApi.productCache.get(cacheKey);
      
      // If the ID contains a query parameter, it's a cache-busting request
      const isCacheBusting = id.includes('?');
      
      // Use cached data if available, not too old, and not a cache-busting request
      if (cachedData && Date.now() - cachedData.timestamp < ProductApi.CACHE_TTL && !isCacheBusting) {
        console.log(`[FETCH STRATEGY] Using cached data for product ${baseId}`);
        return cachedData.data;
      }
      
      console.log(`[FETCH STRATEGY] Cache miss or cache busting - attempting API fetch for product ${baseId}`);
      let retryCount = 0;
      const maxRetries = 1; // Reduce retries for faster fallback
      
      while (retryCount <= maxRetries) {
        try {
          // Attempt to get product from API
          console.log(`[FETCH STRATEGY] API attempt ${retryCount + 1}/${maxRetries + 1} for product ${baseId}`);
          // Use the original ID with query parameters to ensure cache busting on the server side
          const response = await ApiClient.get<Product>(`${this.baseUrl}/${id}`);
          
          console.log(`[FETCH STRATEGY] API fetch succeeded for product ${baseId}`);
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
            console.log(`[FETCH STRATEGY] All API attempts failed, attempting direct database fallback for product ${baseId}`);
            try {
              const fallbackProduct = await this.fetchProductDirectlyById(baseId);
              if (fallbackProduct) {
                console.log(`[FETCH STRATEGY] Successfully retrieved product ${baseId} via database fallback`);
                ProductApi.productCache.set(cacheKey, {
                  data: fallbackProduct,
                  timestamp: Date.now()
                });
                return fallbackProduct;
              }
            } catch (fallbackError) {
              console.error(`[FETCH STRATEGY] Database fallback failed for product ${baseId}:`, fallbackError);
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
   * Update image positions for a product
   * @param productId Product UUID
   * @param imageIds Ordered array of image IDs
   * @returns Promise that resolves when the positions are updated
   */
  public async updateImagePositions(productId: string, imageIds: string[]): Promise<void> {
    try {
      await ApiClient.put<void>(`${this.baseUrl}/${productId}/images/positions`, { imageIds });
      
      // Clear the cache for this product to ensure fresh data on next fetch
      const cacheKey = `product_${productId}`;
      ProductApi.productCache.delete(cacheKey);
    } catch (error) {
      throw this.handleError(error, 'Failed to update image positions');
    }
  }

  /**
   * Update image alt text
   * @param productId Product UUID
   * @param imageId Image UUID
   * @param altText New alt text
   * @returns Promise that resolves when the alt text is updated
   */
  public async updateImageAltText(productId: string, imageId: string, altText: string): Promise<void> {
    try {
      await ApiClient.put<void>(`${this.baseUrl}/${productId}/images/${imageId}`, { altText });
      
      // Clear the cache for this product to ensure fresh data on next fetch
      const cacheKey = `product_${productId}`;
      ProductApi.productCache.delete(cacheKey);
    } catch (error) {
      throw this.handleError(error, 'Failed to update image alt text');
    }
  }

  /**
   * Delete multiple product images
   * @param productId Product UUID
   * @param imageIds Array of image UUIDs to delete
   * @returns Promise that resolves when all images are deleted
   */
  public async removeMultipleProductImages(productId: string, imageIds: string[]): Promise<void> {
    try {
      await ApiClient.post<void>(`${this.baseUrl}/${productId}/images/batch-delete`, { imageIds });
    } catch (error) {
      throw this.handleError(error, 'Failed to delete multiple images');
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

  /**
   * Get inventory data for a product
   * @param productId Product UUID
   * @returns Promise resolving to inventory data for all variants
   */
  public async getProductInventory(productId: string): Promise<ProductVariantWithInventory[]> {
    try {
      console.log(`[ProductApi] Fetching inventory data for product ${productId}`);
      
      // First get the product with variants
      const product = await this.getProduct(productId);
      
      if (!product.variants || product.variants.length === 0) {
        console.log(`[ProductApi] No variants found for product ${productId}`);
        return [];
      }
      
      // Fetch inventory data for all variants of this product using our new endpoint
      let inventoryItems: InventoryItem[] = [];
      try {
        inventoryItems = await ApiClient.get<InventoryItem[]>(`/inventory/product/${productId}`);
        console.log(`[ProductApi] Fetched ${inventoryItems.length} inventory items for product ${productId}`);
      } catch (err) {
        console.error(`[ProductApi] Error fetching inventory from API, using fallback:`, err);
        
        // If the API call fails, try to get inventory data directly from the database
        const variantIds = product.variants.map(variant => variant.id);
        const inventoryByVariant = await this.getInventoryFromDatabase(variantIds);
        
        // Flatten the inventory items
        inventoryItems = Object.values(inventoryByVariant).flat();
      }
      
      // Group inventory items by variant_id
      const inventoryByVariantId: Record<string, InventoryItem[]> = {};
      inventoryItems.forEach(item => {
        if (!inventoryByVariantId[item.variant_id]) {
          inventoryByVariantId[item.variant_id] = [];
        }
        inventoryByVariantId[item.variant_id].push(item);
      });
      
      // For each variant, map to ProductVariantWithInventory
      const variantsWithInventory: ProductVariantWithInventory[] = product.variants.map(variant => {
        // Get inventory items for this variant
        const variantInventory = inventoryByVariantId[variant.id] || [];
        
        // Calculate total and available quantity
        const totalQuantity = variantInventory.reduce((sum, item) => sum + item.quantity, 0);
        const reservedQuantity = variantInventory.reduce((sum, item) => sum + (item.reserved_quantity || 0), 0);
        const availableQuantity = Math.max(0, totalQuantity - reservedQuantity);
        
        // Determine stock status
        let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        
        // If any inventory item has a reorder point, use it to determine low stock
        const hasReorderPoint = variantInventory.some(item => item.reorder_point > 0);
        
        if (availableQuantity <= 0) {
          stockStatus = 'out_of_stock';
        } else if (hasReorderPoint) {
          // Check if any location is below reorder point
          const isLowStock = variantInventory.some(item => 
            item.quantity < item.reorder_point && item.reorder_point > 0
          );
          
          if (isLowStock) {
            stockStatus = 'low_stock';
          }
        } else if (availableQuantity < 5) { // Default low stock threshold
          stockStatus = 'low_stock';
        }
        
        // Convert price and price_adjustment to numbers before adding
        const basePrice = typeof product.price === 'string' ? 
          parseFloat(product.price) : (product.price || 0);
        
        const priceAdjustment = typeof variant.price_adjustment === 'string' ? 
          parseFloat(variant.price_adjustment) : (variant.price_adjustment || 0);
        
        const finalPrice = basePrice + priceAdjustment;
        
        // Convert compare_at_price to number if it exists
        const compareAtPrice = product.compare_at_price ? 
          (typeof product.compare_at_price === 'string' ? 
            parseFloat(product.compare_at_price) : product.compare_at_price) : 
          undefined;
        
        // Safely extract option_values from variant
        const optionValues = (variant as any).option_values || {};
        
        // Map ProductVariant to ProductVariantWithInventory
        return {
          // Original ProductVariant properties
          id: variant.id,
          product_id: variant.product_id,
          sku: variant.sku,
          
          // Additional properties needed for ProductVariantWithInventory
          barcode: '',
          price: finalPrice,
          compare_at_price: compareAtPrice,
          position: 0,
          option_values: optionValues,
          created_at: product.created_at,
          updated_at: product.updated_at,
          
          // Inventory data
          inventory: variantInventory,
          total_quantity: totalQuantity,
          available_quantity: availableQuantity,
          stock_status: stockStatus,
          
          // Include original variant properties for reference
          name: (variant as any).name,
          price_adjustment: priceAdjustment,
          weight: (variant as any).weight,
          current_stock: (variant as any).current_stock
        };
      });
      
      return variantsWithInventory;
    } catch (error) {
      console.error(`[ProductApi] Error fetching product inventory:`, error);
      throw this.handleError(error, 'Failed to fetch product inventory');
    }
  }
  
  /**
   * Fallback method to get inventory data directly from the database
   * This is used when the API endpoint fails
   */
  private async getInventoryFromDatabase(variantIds: string[]): Promise<Record<string, InventoryItem[]>> {
    try {
      console.log(`[ProductApi] Fetching inventory data directly from database for ${variantIds.length} variants`);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .in('variant_id', variantIds)
        .is('deleted_at', null);
      
      if (error) {
        console.error('[ProductApi] Error fetching inventory from database:', error);
        return {};
      }
      
      // Group inventory items by variant_id
      const inventoryByVariant: Record<string, InventoryItem[]> = {};
      
      data.forEach((item: any) => {
        if (!inventoryByVariant[item.variant_id]) {
          inventoryByVariant[item.variant_id] = [];
        }
        
        inventoryByVariant[item.variant_id].push({
          id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity || 0,
          reserved_quantity: item.reserved_quantity || 0,
          reorder_point: item.reorder_point || 0,
          reorder_quantity: item.reorder_quantity || 0,
          location: item.location || 'Default',
          last_counted_at: item.last_counted_at,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
      });
      
      return inventoryByVariant;
    } catch (error) {
      console.error('[ProductApi] Error in database fallback for inventory:', error);
      return {};
    }
  }

  /**
   * ProductVariant management methods
   */

  /**
   * Create a new product variant
   * @param productId Product UUID
   * @param variant Variant data
   * @returns Promise resolving to the created variant
   */
  public async createVariant(productId: string, variant: {
    name: string;
    sku?: string;
    barcode?: string;
    price_adjustment?: number;
    option_values?: Record<string, any>;
  }): Promise<ProductVariant> {
    try {
      console.log(`[ProductApi] Creating variant for product ${productId}`, variant);
      
      // Extract options from option_values to structure them properly
      const options: Record<string, string> = {};
      if (variant.option_values) {
        Object.entries(variant.option_values).forEach(([key, value]) => {
          options[key.toLowerCase()] = value; // Normalize keys to lowercase
        });
      }
      
      // Create the variant DTO according to backend CreateVariantDto
      const variantData: any = {
        productId, 
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        price_adjustment: parseFloat(String(variant.price_adjustment || 0)),
        option_values: {
          // Properly structured option values with descriptive keys
          ...options,
          // Make sure name is included in option_values
          name: variant.name
        }
      };
      
      console.log(`[ProductApi] Sending variant data to backend:`, variantData);
      
      // Make API call
      const response = await ApiClient.post<ProductVariant>(`/variants`, variantData);
      
      // Clear product cache to ensure fresh data on next fetch
      const cacheKey = `product_${productId}`;
      ProductApi.productCache.delete(cacheKey);
      
      return response;
    } catch (error: any) {
      console.error('[ProductApi] Error creating variant:', error);
      
      // Provide more detailed error information
      if (error.status === 500) {
        console.error('[ProductApi] Server error details:', error.message);
        throw new ApiError('Server error occurred while creating variant. Please check logs.', 500);
      } else if (error.status === 400) {
        // Handle validation errors
        console.error('[ProductApi] Validation error:', error.message);
        throw new ApiError(`Validation error: ${error.message}`, 400);
      }
      
      throw this.handleError(error, 'Failed to create product variant');
    }
  }

  /**
   * Update an existing product variant
   * @param variantId Variant UUID
   * @param variant Updated variant data
   * @returns Promise resolving to the updated variant
   */
  public async updateVariant(variantId: string, variant: {
    name?: string;
    sku?: string;
    barcode?: string;
    price_adjustment?: number;
    option_values?: Record<string, any>;
  }): Promise<ProductVariant> {
    try {
      console.log(`[ProductApi] Updating variant ${variantId}`, variant);
      
      // Make API call
      const response = await ApiClient.put<ProductVariant>(`/variants/${variantId}`, variant);
      
      // Clear all relevant caches
      // This is a bit aggressive but ensures consistency
      ProductApi.pageCache.clear();
      
      return response;
    } catch (error) {
      console.error('[ProductApi] Error updating variant:', error);
      throw this.handleError(error, 'Failed to update product variant');
    }
  }

  /**
   * Delete a product variant
   * @param variantId Variant UUID
   * @returns Promise that resolves when the variant is deleted
   */
  public async deleteVariant(variantId: string): Promise<void> {
    try {
      console.log(`[ProductApi] Deleting variant ${variantId}`);
      
      // Make API call
      await ApiClient.delete(`/variants/${variantId}`);
      
      // Clear all relevant caches
      ProductApi.pageCache.clear();
    } catch (error) {
      console.error('[ProductApi] Error deleting variant:', error);
      throw this.handleError(error, 'Failed to delete product variant');
    }
  }

  /**
   * Get variants for a product
   * @param productId Product UUID
   * @returns Promise resolving to an array of variants
   */
  public async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      console.log(`[ProductApi] Fetching variants for product ${productId}`);
      
      try {
        // First try to get variants from the dedicated endpoint
        const response = await ApiClient.get<ProductVariant[]>(`/variants/product/${productId}`);
        console.log(`[ProductApi] Successfully fetched ${response.length} variants from API`);
        return response;
      } catch (apiError) {
        console.warn(`[ProductApi] Error fetching variants from API, falling back to product data:`, apiError);
        
        // Fallback: Get the product and use its variants
        const product = await this.getProduct(productId);
        
        if (product.variants && product.variants.length > 0) {
          console.log(`[ProductApi] Using ${product.variants.length} variants from product data as fallback`);
          return product.variants;
        } else {
          console.log(`[ProductApi] No variants found in product data`);
          return [];
        }
      }
    } catch (error) {
      console.error('[ProductApi] Error fetching product variants:', error);
      // Don't throw, just return empty array
      return [];
    }
  }

  /**
   * Create inventory item for a variant
   * @param variantId Variant UUID
   * @param inventoryData Inventory data
   * @returns Promise resolving to the created inventory item
   */
  public async createInventoryItem(
    variantId: string, 
    inventoryData: {
      quantity: number;
      location?: string;
      reorder_point?: number;
      reorder_quantity?: number;
    }
  ): Promise<InventoryItem> {
    try {
      console.log(`[ProductApi] Creating inventory item for variant ${variantId}`, inventoryData);
      
      // Set default values
      const location = inventoryData.location || 'Default';
      const reorder_point = inventoryData.reorder_point || 5;
      const reorder_quantity = inventoryData.reorder_quantity || 10;
      
      // Create payload for inventory service
      const payload = {
        variant_id: variantId,
        location,
        quantity: inventoryData.quantity,
        reserved_quantity: 0,
        reorder_point,
        reorder_quantity
      };
      
      // Make API call to inventory service
      const response = await ApiClient.post<InventoryItem>('/inventory', payload);
      
      return response;
    } catch (error) {
      console.error('[ProductApi] Error creating inventory item:', error);
      throw this.handleError(error, 'Failed to create inventory item');
    }
  }

  /**
   * Get all inventory items for a product
   * @param productId Product UUID
   * @returns Promise resolving to an array of inventory items
   */
  public async getInventoryItems(productId: string): Promise<InventoryItem[]> {
    try {
      console.log(`[ProductApi] Fetching inventory items for product ${productId}`);
      
      const response = await ApiClient.get<InventoryItem[]>(`/inventory/product/${productId}`);
      return response;
    } catch (error) {
      console.error('[ProductApi] Error fetching inventory items:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Clears product cache to ensure fresh data on next fetch
   * @param productId - The product ID to clear cache for
   */
  async clearProductCache(productId?: string): Promise<void> {
    if (productId) {
      // Clear specific product cache
      console.log(`Clearing cache for product ${productId}`);
      const cacheKey = `product_${productId}`;
      ProductApi.productCache.delete(cacheKey);
    } else {
      // Clear all product caches
      console.log('Clearing all product caches');
      ProductApi.productCache.clear();
    }
  }

  /**
   * Creates an inventory record for a new product
   * This is used when a basic product is created before variants
   * @param productId - The product ID
   * @param variantId - The variant ID (default variant)
   * @param quantity - Initial quantity
   * @returns Created inventory item
   */
  async createInitialInventory(productId: string, variantId: string, quantity: number): Promise<any> {
    try {
      console.log(`Creating initial inventory record for product ${productId}, variant ${variantId} with quantity ${quantity}`);
      
      const inventoryData = {
        variant_id: variantId,
        location: 'Default',
        quantity: quantity,
        reserved_quantity: 0,
        reorder_point: 5, // Default reorder point
        reorder_quantity: 10 // Default reorder quantity
      };
      
      const response = await ApiClient.post<any>(`/inventory`, inventoryData);
      console.log('Inventory record created:', response.data);
      
      // Clear the product cache to ensure fresh data
      await this.clearProductCache(productId);
      
      return response.data;
    } catch (error) {
      console.error('Error creating inventory record:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productApi = new ProductApi(); 