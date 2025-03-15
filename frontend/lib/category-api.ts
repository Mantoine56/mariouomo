/**
 * Category API Service
 * 
 * Provides methods to interact with the category endpoints of the backend API.
 * Uses the ApiClient for making authenticated HTTP requests.
 */
import { ApiClient } from './api-client';
import { supabase } from './supabase';

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
} 