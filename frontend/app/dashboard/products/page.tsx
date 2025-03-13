'use client';

/**
 * Products Management Page
 * 
 * Displays a list of products with filtering, sorting, and search capabilities
 * Allows admins to manage product inventory, categories, and attributes
 */
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Package, Plus, Search, Loader2, Trash2, Archive, CheckCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './components/columns';
import { 
  Product, 
  productApi, 
  ProductSearchParams, 
  PaginatedResponse, 
  ProductStatus,
  ProductSortField,
  SortDirection
} from '@/lib/product-api';
import { ApiError } from '@/lib/api-client';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

// Define a frontend product type that matches what the UI expects
// This helps us adapt between the backend and frontend data structures
interface FrontendProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
  inventory: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  images?: Array<{
    id: string;
    url: string;
    name: string;
    size: number;
  }>;
  cost?: number;
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  /**
   * Convert backend Product to frontend format
   */
  const adaptProductToFrontend = (product: Product): FrontendProduct => {
    // Calculate inventory - in real data this might come from variants
    // For now, we'll use a default value or extract from metadata
    const inventory = product.variants?.reduce((total, variant) => total + (variant.current_stock || 0), 0) || 10;
    
    // Determine status based on inventory or backend status
    let status: 'Active' | 'Low Stock' | 'Out of Stock';
    if (product.status === 'active') {
      status = inventory > 10 ? 'Active' : inventory > 0 ? 'Low Stock' : 'Out of Stock';
    } else {
      status = 'Out of Stock';
    }
    
    // Extract category from metadata or use a default
    const category = product.metadata?.category || 'Uncategorized';
    
    // Extract cost from cost_price field
    const cost = product.cost_price;
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category,
      description: product.description,
      photo_url: product.images?.[0]?.original_url,
      created_at: product.created_at,
      updated_at: product.updated_at,
      inventory,
      status,
      cost,
    };
  };

  /**
   * Fetch products based on filters
   */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Create search params object for the API
      const searchParams: ProductSearchParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Add search query for backend filtering
      if (searchQuery) {
        searchParams.query = searchQuery.trim();
      }

      // Add status filter if selected and supported by backend
      if (selectedStatus) {
        // Map frontend status to backend status
        if (selectedStatus === 'Active') {
          searchParams.status = ProductStatus.ACTIVE;
        } else if (selectedStatus === 'Out of Stock') {
          searchParams.status = ProductStatus.INACTIVE;
        }
        // 'Low Stock' would require inventory filtering which might not be available in the API
      }

      console.log('Fetching products with params:', searchParams);

      // Fetch products from API - no fallback data, focus on real database connection
      const response = await productApi.searchProducts(searchParams);
      
      // Extract product data
      const { items, total } = response;
      
      console.log(`Fetched ${items.length} products out of ${total} total`);
      
      // Update available categories based on incoming products
      const categoriesSet = new Set<string>();
      items.forEach(product => {
        if (product.metadata?.category) {
          categoriesSet.add(product.metadata.category);
        }
      });
      setAvailableCategories(categoriesSet);
      
      // Convert backend products to frontend format
      const frontendProducts = items.map(adaptProductToFrontend);
      
      // Apply client-side category filtering if needed
      const filteredProducts = selectedCategory && selectedCategory !== ''
        ? frontendProducts.filter(product => product.category === selectedCategory)
        : frontendProducts;
      
      setProducts(filteredProducts);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Show error toast with more specific message
      toast({
        title: 'Error fetching products',
        description: error instanceof ApiError 
          ? `API Error (${error.status}): ${error.message}` 
          : error instanceof Error 
            ? `Error: ${error.message}` 
            : 'An unknown error occurred. The server may be unavailable.',
        variant: 'destructive',
      });
      
      // Reset products list but keep UI functional
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedStatus, currentPage, itemsPerPage]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  /**
   * Handle category selection change
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  /**
   * Handle status selection change
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when status changes
  };

  /**
   * Handle page change from DataTable
   */
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page + 1); // Log the page change for debugging
    
    // DataTable uses 0-based index, we use 1-based
    setCurrentPage(page + 1);
  };

  /**
   * Handle page size change from DataTable
   */
  const handlePageSizeChange = (size: number) => {
    console.log('Changing page size to:', size); // Log the page size change for debugging
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  /**
   * Handle bulk actions on selected products
   */
  const handleBulkAction = async (action: 'delete' | 'archive' | 'activate') => {
    setBulkActionLoading(true);
    
    try {
      const selectedProductIds = Object.entries(selectedRows)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);
      
      if (selectedProductIds.length === 0) {
        toast({
          title: 'No products selected',
          description: 'Please select at least one product to perform this action.',
          variant: 'default',
        });
        return;
      }
      
      // Process each selected product
      for (const id of selectedProductIds) {
        if (action === 'delete') {
          await productApi.deleteProduct(id);
        } else {
          // For archive/activate, update the product status
          await productApi.updateProduct(id, {
            status: action === 'activate' ? 'active' : 'inactive',
          });
        }
      }
      
      // Show success message
      toast({
        title: 'Success',
        description: `${selectedProductIds.length} products ${
          action === 'delete' ? 'deleted' : action === 'archive' ? 'archived' : 'activated'
        } successfully.`,
        variant: 'success',
      });
      
      // Clear selection and refresh products
      setSelectedRows({});
      fetchProducts();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} products. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Render bulk action buttons
   */
  const renderBulkActions = (selectedRows: Record<string, boolean>) => {
    return (
      <>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleBulkAction('activate')}
          disabled={bulkActionLoading}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Set Active
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleBulkAction('archive')}
          disabled={bulkActionLoading}
        >
          <Archive className="h-4 w-4 mr-2" />
          Set Out of Stock
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleBulkAction('delete')}
          disabled={bulkActionLoading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1 md:col-span-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <select 
          className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {Array.from(availableCategories).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select 
          className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          value={selectedStatus}
          onChange={handleStatusChange}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>
      
      {/* Products DataTable */}
      <DashboardCard title="Product Inventory" noPadding>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-gray-500">Loading products...</span>
              </div>
            </div>
          )}
          
          <DataTable 
            columns={columns} 
            data={products} 
            totalItems={totalProducts}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage - 1} // Convert 1-based to 0-based for DataTable
            pageSize={itemsPerPage}
            enableRowSelection={true}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            renderBulkActions={renderBulkActions}
          />
        </div>
      </DashboardCard>
    </div>
  );
} 