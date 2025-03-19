/**
 * Category API Service
 * 
 * Provides methods to interact with the category endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient } from './api-client';
import { supabase } from './supabase';

/**
 * Product image interface for database
 */
interface ProductImageDB {
  id?: string;
  product_id: string;
  url: string;
  position: number;
}

/**
 * Product interface for the category products
 */
interface CategoryProduct {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
  is_published: boolean;
  images?: {
    id: string;
    url: string;
    position: number;
  }[];
}

/**
 * Category interface - matches backend Category entity structure
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  position: number;
  isVisible: boolean;
  childCount: number;
  totalProducts: number;
  path?: string;
  parentId?: string;
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  children?: Category[];
}

/**
 * CategoryApi class for interacting with category endpoints
 */
export class CategoryApi {
  private baseUrl: string;
  private static categoryCache: { data: Category[], timestamp: number } | null = null;
  private static categoryTreeCache: { data: Category[], timestamp: number } | null = null;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private static isBackendAvailable: boolean | null = null;

  /**
   * Constructor initializes the base URL
   */
  constructor() {
    // Set the base URL to the categories endpoint
    this.baseUrl = '/categories';
  }

  /**
   * Check if the backend API is available
   * This avoids repeated failed API calls
   */
  private async checkBackendAvailability(): Promise<boolean> {
    // If we've already checked and it's unavailable, don't try again
    if (CategoryApi.isBackendAvailable === false) {
      return false;
    }
    
    try {
      // Try to get auth token, if none is available we can't access API
      const token = await ApiClient.getAuthToken();
      if (!token) {
        CategoryApi.isBackendAvailable = false;
        return false;
      }
      
      // If we haven't explicitly checked connection, do so now
      if (CategoryApi.isBackendAvailable === null) {
        const isAvailable = await ApiClient.isBackendAvailable();
        CategoryApi.isBackendAvailable = isAvailable;
        return isAvailable;
      }
      
      return CategoryApi.isBackendAvailable;
    } catch (e) {
      CategoryApi.isBackendAvailable = false;
      return false;
    }
  }

  /**
   * Get categories directly from Supabase database
   * Used as fallback when API is unavailable
   */
  private async getCategoriesFromDatabase(): Promise<Category[]> {
    // Fetch from database
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      throw new Error(`Failed to fetch categories from database: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.error('No categories found in database');
      throw new Error('No categories found in database');
    }
    
    // Convert database fields to match Category interface
    return data.map(dbCategory => ({
      id: dbCategory.id,
      name: dbCategory.name,
      slug: dbCategory.slug,
      description: dbCategory.description,
      imageUrl: dbCategory.image_url,
      position: dbCategory.position,
      isVisible: dbCategory.is_visible,
      childCount: dbCategory.child_count,
      totalProducts: dbCategory.total_products,
      path: '',
      seoMetadata: dbCategory.seo_metadata
    }));
  }

  /**
   * Get all categories
   * @returns Promise resolving to an array of Categories
   */
  public async getCategories(): Promise<Category[]> {
    try {
      // Check cache first
      if (
        CategoryApi.categoryCache && 
        Date.now() - CategoryApi.categoryCache.timestamp < CategoryApi.CACHE_TTL
      ) {
        return CategoryApi.categoryCache.data;
      }

      let categories: Category[] = [];
      
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          // Try to fetch from the API
          categories = await ApiClient.get<Category[]>(`${this.baseUrl}/tree`);
          categories = this.flattenCategoryTree(categories);
          
          // If API call works, update our availability flag
          CategoryApi.isBackendAvailable = true;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database query
          categories = await this.getCategoriesFromDatabase();
        }
      } else {
        // Backend API is not available, use database directly
        categories = await this.getCategoriesFromDatabase();
      }
      
      // Update cache with categories
      CategoryApi.categoryCache = {
        data: categories,
        timestamp: Date.now()
      };
      
      return categories;
    } catch (error: any) {
      throw new Error(`Failed to fetch categories: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get category tree (hierarchical structure)
   * @returns Promise resolving to an array of Categories with children
   */
  public async getCategoryTree(): Promise<Category[]> {
    try {
      // Check cache first
      if (
        CategoryApi.categoryTreeCache && 
        Date.now() - CategoryApi.categoryTreeCache.timestamp < CategoryApi.CACHE_TTL
      ) {
        return CategoryApi.categoryTreeCache.data;
      }

      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          // Try to fetch tree structure from backend API
          const categoryTree = await ApiClient.get<Category[]>(`${this.baseUrl}/tree`);
          
          // Update cache
          CategoryApi.categoryTreeCache = {
            data: categoryTree,
            timestamp: Date.now()
          };
          
          // If API call works, update our availability flag
          CategoryApi.isBackendAvailable = true;
          
          return categoryTree;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
        }
      }
      
      // Fall back to direct Supabase query with parent-child relationships
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('position');
      
      if (error) {
        console.error('Error fetching categories from Supabase:', error);
        throw new Error(`Failed to fetch categories from database: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.error('No categories found in database');
        throw new Error('No categories found in database');
      }
      
      // Convert database categories to Category interface
      const dbCategories = data.map(dbCategory => ({
        id: dbCategory.id,
        name: dbCategory.name,
        slug: dbCategory.slug,
        description: dbCategory.description,
        imageUrl: dbCategory.image_url,
        position: dbCategory.position,
        isVisible: dbCategory.is_visible,
        childCount: dbCategory.child_count,
        totalProducts: dbCategory.total_products,
        path: '',
        parentId: dbCategory.parentid,
        seoMetadata: dbCategory.seo_metadata,
        children: [] as Category[]
      }));
      
      // Create tree structure based on parentId
      const categoryMap = new Map<string, any>();
      dbCategories.forEach(category => categoryMap.set(category.id, category));
      
      const rootCategories: Category[] = [];
      
      dbCategories.forEach(category => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(category);
          }
        } else {
          rootCategories.push(category);
        }
        
        // Remove the temporary parentId field
        delete category.parentId;
      });
      
      // Update cache with the tree structure
      CategoryApi.categoryTreeCache = {
        data: rootCategories,
        timestamp: Date.now()
      };
      
      return rootCategories;
    } catch (error: any) {
      throw new Error(`Failed to fetch category tree: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Clear the category cache
   * Called after create, update, or delete operations
   */
  private clearCache(): void {
    CategoryApi.categoryCache = null;
    CategoryApi.categoryTreeCache = null;
  }

  /**
   * Flatten a category tree into a single array
   * @param categoryTree The category tree to flatten
   * @returns Flattened array of categories
   */
  private flattenCategoryTree(categoryTree: Category[]): Category[] {
    const result: Category[] = [];
    
    const flatten = (categories: Category[]) => {
      for (const category of categories) {
        result.push(category);
        
        if (category.children && category.children.length > 0) {
          flatten(category.children);
        }
      }
    };
    
    flatten(categoryTree);
    return result;
  }

  /**
   * Get a category by ID
   * @param id Category ID
   * @returns Promise resolving to a single Category
   */
  public async getCategoryById(id: string): Promise<Category> {
    try {
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          // Try to fetch from API
          const category = await ApiClient.get<Category>(`${this.baseUrl}/${id}`);
          
          // If API call works, update availability flag
          CategoryApi.isBackendAvailable = true;
          return category;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database query
          const category = await this.getCategoryByIdFromDatabase(id);
          return category;
        }
      } else {
        // Backend API is not available, use database directly
        return this.getCategoryByIdFromDatabase(id);
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch category by ID: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a category by ID directly from Supabase
   * @param id Category ID
   * @returns Promise resolving to a single Category
   */
  private async getCategoryByIdFromDatabase(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching category from Supabase:', error);
      throw new Error(`Failed to fetch category from database: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    // Convert database fields to match Category interface
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.image_url,
      position: data.position,
      isVisible: data.is_visible,
      childCount: data.child_count,
      totalProducts: data.total_products,
      path: '',
      parentId: data.parentid,
      seoMetadata: data.seo_metadata
    };
  }

  /**
   * Create a new category
   * @param category Category data
   * @returns Promise resolving to the created Category
   */
  public async createCategory(category: Omit<Category, 'id' | 'childCount' | 'totalProducts' | 'children'>): Promise<Category> {
    try {
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      // Prepare the data for API submission
      const categoryData = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        position: category.position,
        isVisible: category.isVisible,
        parentId: category.parentId,
        seoMetadata: category.seoMetadata
      };
      
      if (isBackendAvailable) {
        try {
          // Try to create via API
          const createdCategory = await ApiClient.post<Category>(this.baseUrl, categoryData);
          
          // Clear cache after creating
          this.clearCache();
          
          // If API call works, update availability flag
          CategoryApi.isBackendAvailable = true;
          return createdCategory;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database creation
          return this.createCategoryInDatabase(category);
        }
      } else {
        // Backend API is not available, use database directly
        return this.createCategoryInDatabase(category);
      }
    } catch (error: any) {
      throw new Error(`Failed to create category: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new category directly in Supabase
   * @param category Category data
   * @returns Promise resolving to the created Category
   */
  private async createCategoryInDatabase(
    category: Omit<Category, 'id' | 'childCount' | 'totalProducts' | 'children'>
  ): Promise<Category> {
    try {
      // Prepare data for insertion
      const categoryData = {
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        image_url: category.imageUrl || null,
        position: category.position,
        is_visible: category.isVisible,
        parentid: category.parentId || null,
        seo_metadata: category.seoMetadata || {}
      };

      // Insert into database
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating category in database:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to retrieve created category');
      }

      // Convert to Category interface
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        position: data.position,
        isVisible: data.is_visible,
        childCount: 0,
        totalProducts: 0,
        parentId: data.parentid,
        seoMetadata: data.seo_metadata
      };
    } catch (error: any) {
      throw new Error(`Failed to create category in database: ${error.message}`);
    }
  }

  /**
   * Update an existing category
   * @param id Category ID
   * @param category Updated category data
   * @returns Promise resolving to the updated Category
   */
  public async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    try {
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      // Prepare the data for API submission, only including fields that should be updated
      const updateData: Record<string, any> = {};
      if (category.name !== undefined) updateData.name = category.name;
      if (category.slug !== undefined) updateData.slug = category.slug;
      if (category.description !== undefined) updateData.description = category.description;
      // Allow null values for imageUrl to support image deletion
      if (category.imageUrl !== undefined) updateData.imageUrl = category.imageUrl;
      if (category.position !== undefined) updateData.position = category.position;
      if (category.isVisible !== undefined) updateData.isVisible = category.isVisible;
      if (category.parentId !== undefined) updateData.parentId = category.parentId;
      if (category.seoMetadata !== undefined) updateData.seoMetadata = category.seoMetadata;
      
      if (isBackendAvailable) {
        try {
          // Try to update via API
          const updatedCategory = await ApiClient.put<Category>(`${this.baseUrl}/${id}`, updateData);
          
          // Clear cache after updating
          this.clearCache();
          
          // If API call works, update availability flag
          CategoryApi.isBackendAvailable = true;
          return updatedCategory;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database update
          return this.updateCategoryInDatabase(id, category);
        }
      } else {
        // Backend API is not available, use database directly
        return this.updateCategoryInDatabase(id, category);
      }
    } catch (error: any) {
      throw new Error(`Failed to update category: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing category directly in Supabase
   * @param id Category ID
   * @param category Updated category data
   * @returns Promise resolving to the updated Category
   */
  private async updateCategoryInDatabase(id: string, category: Partial<Category>): Promise<Category> {
    try {
      // Prepare data for update
      const updateData: Record<string, any> = {};
      
      if (category.name !== undefined) updateData.name = category.name;
      if (category.slug !== undefined) updateData.slug = category.slug;
      if (category.description !== undefined) updateData.description = category.description;
      if (category.imageUrl !== undefined) updateData.image_url = category.imageUrl; // This handles null values as well
      if (category.position !== undefined) updateData.position = category.position;
      if (category.isVisible !== undefined) updateData.is_visible = category.isVisible;
      if (category.parentId !== undefined) updateData.parentid = category.parentId;
      if (category.seoMetadata !== undefined) updateData.seo_metadata = category.seoMetadata;

      // Console log to debug image deletion
      console.log('Updating category in database:', { id, updateData });

      // Update in database
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category in database:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to retrieve updated category');
      }

      // Log the retrieved category data
      console.log('Updated category from database:', data);

      // Convert to Category interface
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        position: data.position,
        isVisible: data.is_visible,
        childCount: data.child_count || 0,
        totalProducts: data.total_products || 0,
        parentId: data.parentid,
        seoMetadata: data.seo_metadata
      };
    } catch (error: any) {
      throw new Error(`Failed to update category in database: ${error.message}`);
    }
  }

  /**
   * Get products in a category
   * @param categoryId Category ID
   * @param options Optional parameters for pagination and filtering
   * @returns Promise resolving to a paginated list of products
   */
  public async getCategoryProducts(
    categoryId: string,
    options: {
      page?: number;
      limit?: number;
      query?: string;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<any> {
    console.log(`Fetching products for category ${categoryId}`);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.query) params.append('query', options.query);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortDirection) params.append('sortDirection', options.sortDirection);
      
      // Make API request
      const response = await ApiClient.get<any>(`${this.baseUrl}/${categoryId}/products?${params.toString()}`);
      return response;
    } catch (error: any) {
      console.error(`[API] Error fetching category products:`, error);
      
      // Check for specific error types
      if (error && error.status === 0) {
        console.log('Network error detected, falling back to database');
        return this.getCategoryProductsFromDatabase(categoryId, options);
      }
      
      if (error && error.status === 404) {
        console.log('API endpoint not found, falling back to database');
        return this.getCategoryProductsFromDatabase(categoryId, options);
      }
      
      throw error;
    }
  }
  
  /**
   * Get products in a category directly from the database
   * @param categoryId Category ID
   * @param options Optional parameters for pagination and filtering
   * @returns Promise resolving to a paginated list of products
   */
  private async getCategoryProductsFromDatabase(
    categoryId: string,
    options: {
      page?: number;
      limit?: number;
      query?: string;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<any> {
    try {
      console.log(`Fetching products for category ${categoryId} from database directly`);
      
      // Set up pagination parameters
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      
      // Step 1: First, get the product IDs for this category from the junction table
      const { data: productRelations, error: relationsError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId);
      
      if (relationsError) {
        console.error('Error fetching product relations:', relationsError);
        throw new Error(`Failed to fetch product relations: ${relationsError.message}`);
      }
      
      // If no product relationships exist, return empty result
      if (!productRelations || productRelations.length === 0) {
        console.log(`No products found for category ${categoryId}`);
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
      
      // Extract the product IDs
      const productIds = productRelations.map(rel => rel.product_id);
      console.log(`Found ${productIds.length} product IDs for category ${categoryId}`);
      
      // Step 2: Fetch products by their IDs
      let productsQuery = supabase
        .from('products')
        .select('id, name, price, metadata, description, status', { count: 'exact' });
      
      // Apply search filter if provided
      if (options.query) {
        productsQuery = productsQuery.ilike('name', `%${options.query}%`);
      }
      
      // Filter by the extracted product IDs
      productsQuery = productsQuery.in('id', productIds);
      
      // Apply sorting if provided
      if (options.sortBy && options.sortDirection) {
        productsQuery = productsQuery.order(options.sortBy, { ascending: options.sortDirection === 'ASC' });
      } else {
        // Default sorting by name
        productsQuery = productsQuery.order('name', { ascending: true });
      }
      
      // Apply pagination
      productsQuery = productsQuery.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data: products, error: productsError, count } = await productsQuery;
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }
      
      // Step 3: Now fetch the product images
      let productImagesQuery = supabase
        .from('product_images')
        .select('product_id, url, position')
        .in('product_id', productIds)
        .order('position');
      
      const { data: productImages, error: imagesError } = await productImagesQuery;
      
      if (imagesError) {
        console.warn('Error fetching product images:', imagesError);
        // Continue without images rather than failing completely
      }
      
      // Create a map of product IDs to their images
      const productImagesMap = new Map<string, ProductImageDB[]>();
      if (productImages && productImages.length > 0) {
        productImages.forEach((img: ProductImageDB) => {
          if (!productImagesMap.has(img.product_id)) {
            productImagesMap.set(img.product_id, []);
          }
          productImagesMap.get(img.product_id)?.push(img);
        });
      }
      
      // Step 4: Map products to the expected format
      const mappedProducts = products?.map(product => {
        // Get images for this product, or use empty array if none
        const images = productImagesMap.get(product.id) || [];
        const primaryImageUrl = images.length > 0 ? images[0].url : null;
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          // Use first image as primary image, or null if no images
          image_url: primaryImageUrl,
          sku: product.metadata?.sku || product.id.substring(0, 8),
          stock_quantity: product.metadata?.stock_quantity || 0,
          is_published: product.status === 'active',
          // Include all images for reference
          images: images.map(img => ({
            id: img.id || '',
            url: img.url,
            position: img.position
          }))
        } as CategoryProduct;
      }) || [];
      
      console.log(`Successfully fetched ${mappedProducts.length} products for category ${categoryId}`);
      
      return {
        items: mappedProducts,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: (count || 0) > offset + limit,
        hasPreviousPage: page > 1
      };
    } catch (error: any) {
      console.error('Error in getCategoryProductsFromDatabase:', error);
      throw new Error(`Failed to fetch category products from database: ${error.message}`);
    }
  }
  
  /**
   * Add products to a category
   * @param categoryId Category ID
   * @param productIds Array of product IDs to add
   * @returns Promise resolving to success status
   */
  public async addProductsToCategory(
    categoryId: string,
    productIds: string[]
  ): Promise<boolean> {
    try {
      console.log(`Adding ${productIds.length} products to category ${categoryId}`);
      
      if (!productIds.length) {
        return true; // Nothing to do
      }
      
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          // Try to add via API
          await ApiClient.post<any>(
            `${this.baseUrl}/${categoryId}/products`, 
            { productIds }
          );
          
          // Clear cache after update
          this.clearCache();
          
          // If API call works, update availability flag
          CategoryApi.isBackendAvailable = true;
          return true;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database update
          return this.addProductsToCategoryInDatabase(categoryId, productIds);
        }
      } else {
        // Backend API is not available, use database directly
        return this.addProductsToCategoryInDatabase(categoryId, productIds);
      }
    } catch (error: any) {
      throw new Error(`Failed to add products to category: ${error?.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Add products to a category directly in the database
   * @param categoryId Category ID
   * @param productIds Array of product IDs to add
   * @returns Promise resolving to success status
   */
  private async addProductsToCategoryInDatabase(
    categoryId: string,
    productIds: string[]
  ): Promise<boolean> {
    try {
      // First, get existing product-category relationships to avoid duplicates
      const { data: existingRelations, error: fetchError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId)
        .in('product_id', productIds);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Filter out product IDs that are already in the category
      const existingProductIds = new Set(existingRelations?.map(r => r.product_id) || []);
      const newProductIds = productIds.filter(id => !existingProductIds.has(id));
      
      if (newProductIds.length === 0) {
        return true; // All products are already in the category
      }
      
      // Prepare the data to insert
      const relationships = newProductIds.map(productId => ({
        category_id: categoryId,
        product_id: productId
      }));
      
      // Insert the new relationships
      const { error: insertError } = await supabase
        .from('product_categories')
        .insert(relationships);
      
      if (insertError) {
        throw insertError;
      }
      
      // Clear cache after update
      this.clearCache();
      
      return true;
    } catch (error: any) {
      throw new Error(`Failed to add products to category in database: ${error.message}`);
    }
  }
  
  /**
   * Remove products from a category
   * @param categoryId Category ID
   * @param productIds Array of product IDs to remove
   * @returns Promise resolving to success status
   */
  public async removeProductsFromCategory(
    categoryId: string,
    productIds: string[]
  ): Promise<boolean> {
    try {
      console.log(`Removing ${productIds.length} products from category ${categoryId}`);
      
      if (!productIds.length) {
        return true; // Nothing to do
      }
      
      // Check if backend API is available
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          // Try to remove via API
          await ApiClient.delete<any>(
            `${this.baseUrl}/${categoryId}/products?productIds=${productIds.join(',')}`
          );
          
          // Clear cache after update
          this.clearCache();
          
          // If API call works, update availability flag
          CategoryApi.isBackendAvailable = true;
          return true;
        } catch (apiError: any) {
          // If API fails with a 500, mark as unavailable for future calls
          if (apiError instanceof Error && 'status' in apiError && apiError.status === 500) {
            CategoryApi.isBackendAvailable = false;
          }
          
          // Fall back to direct database update
          return this.removeProductsFromCategoryInDatabase(categoryId, productIds);
        }
      } else {
        // Backend API is not available, use database directly
        return this.removeProductsFromCategoryInDatabase(categoryId, productIds);
      }
    } catch (error: any) {
      throw new Error(`Failed to remove products from category: ${error?.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Remove products from a category directly in the database
   * @param categoryId Category ID
   * @param productIds Array of product IDs to remove
   * @returns Promise resolving to success status
   */
  private async removeProductsFromCategoryInDatabase(
    categoryId: string,
    productIds: string[]
  ): Promise<boolean> {
    try {
      // Delete the relationships
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('category_id', categoryId)
        .in('product_id', productIds);
      
      if (error) {
        throw error;
      }
      
      // Clear cache after update
      this.clearCache();
      
      return true;
    } catch (error: any) {
      throw new Error(`Failed to remove products from category in database: ${error.message}`);
    }
  }

  /**
   * Check if the backend API is available
   * This avoids repeated failed API calls and can be called from outside the class
   */
  public async isBackendAvailable(): Promise<boolean> {
    return this.checkBackendAvailability();
  }

  /**
   * Update category product counts via API
   * This triggers a recalculation of product counts for all categories
   */
  public async updateCategoryProductCounts(): Promise<boolean> {
    try {
      // Check if backend is available first
      const isAvailable = await this.checkBackendAvailability();
      if (!isAvailable) {
        console.error('Cannot update category product counts: Backend API is not available');
        return false;
      }

      // Call the API endpoint to update counts
      await ApiClient.post<void>(`${this.baseUrl}/update-counts`, {});
      
      // Clear cache after update
      this.clearCache();
      
      return true;
    } catch (error: any) {
      console.error('Failed to update category product counts:', error?.message || 'Unknown error');
      return false;
    }
  }
} 