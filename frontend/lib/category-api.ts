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
  imageUrl?: string;
  position: number;
  isVisible: boolean;
  childCount: number;
  totalProducts: number;
  path?: string;
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
} 