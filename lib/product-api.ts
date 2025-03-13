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
      // Check for cached product first
      const cacheKey = `product_${id}`;
      const cachedData = ProductApi.productCache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < ProductApi.CACHE_TTL) {
        console.log(`Using cached data for product ${id}`);
        return cachedData.data;
      }
      
      console.log(`Fetching product with ID: ${id}`);
      let response: Product;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          // Attempt to get product from API
          response = await ApiClient.get<Product>(`${this.baseUrl}/${id}`);
          
          // Cache successful response
          ProductApi.productCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
          });
          
          return response;
        } catch (error) {
          console.error(`Error fetching product (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
          
          if (retryCount === maxRetries) {
            // Try fallback to direct database query on last attempt
            console.log(`Attempting direct database fallback for product ${id}`);
            try {
              const fallbackProduct = await this.fetchProductDirectlyById(id);
              if (fallbackProduct) {
                console.log(`Successfully retrieved product ${id} via fallback`);
                ProductApi.productCache.set(cacheKey, {
                  data: fallbackProduct,
                  timestamp: Date.now()
                });
                return fallbackProduct;
              }
            } catch (fallbackError) {
              console.error(`Fallback retrieval failed for product ${id}:`, fallbackError);
            }
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
        }
      }
      
      throw new Error(`Failed to fetch product after ${maxRetries} retries`);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch product with ID: ${id}`);
    }
  }
  
  /**
   * Fetch a single product directly from Supabase
   * For fallback use when the API endpoint fails
   */
  private async fetchProductDirectlyById(id: string): Promise<Product | null> {
    try {
      console.log(`Fetching product ${id} directly from Supabase database`);
      
      // Query the product by ID
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), product_images(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn(`Product with ID ${id} not found in direct database query`);
        return null;
      }
      
      // Transform to Product format
      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        compare_at_price: data.compare_at_price,
        cost_price: data.cost_price,
        status: data.status,
        store_id: data.store_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        metadata: data.metadata,
        variants: data.product_variants?.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price_adjustment: variant.price_adjustment,
          current_stock: variant.current_stock,
          product_id: variant.product_id
        })) || [],
        images: data.product_images?.map((img: any) => ({
          id: img.id,
          product_id: img.product_id,
          original_url: img.url,
          thumbnail_url: img.thumbnail_url || img.url,
          created_at: img.created_at
        })) || []
      };
      
      console.log(`Transformed product data: ${product.name} (${product.id})`);
      return product;
    } catch (error) {
      console.error(`Error fetching product ${id} directly from database:`, error);
      throw error;
    }
  }
} 