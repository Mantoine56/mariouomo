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
import { Product, fakeProducts } from '@/lib/mock-api';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch products based on filters
   */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (selectedCategory) {
        filters.categories = selectedCategory;
      }

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      const data = await fakeProducts.getProducts(filters);
      setProducts(data.products);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
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
    setCurrentPage(page + 1); // DataTable uses 0-based index, we use 1-based
  };

  /**
   * Handle page size change from DataTable
   */
  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  /**
   * Handle bulk delete action
   */
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${Object.keys(selectedRows).length} products?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      // Get array of selected product IDs
      const productIds = Object.keys(selectedRows);
      
      // Call API to delete products
      await Promise.all(productIds.map(id => fakeProducts.deleteProduct(id)));
      
      // Show success message
      toast({
        title: "Products deleted",
        description: `Successfully deleted ${productIds.length} products`,
        variant: "default",
      });
      
      // Clear selection and refresh products
      setSelectedRows({});
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Error",
        description: "Failed to delete products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Handle bulk status update action
   */
  const handleBulkStatusUpdate = async (status: 'Active' | 'Low Stock' | 'Out of Stock') => {
    setBulkActionLoading(true);
    try {
      // Get array of selected product IDs
      const productIds = Object.keys(selectedRows);
      
      // Call API to update product status
      await Promise.all(productIds.map(id => 
        fakeProducts.updateProduct(id, { status })
      ));
      
      // Show success message
      toast({
        title: "Products updated",
        description: `Successfully updated ${productIds.length} products to ${status}`,
        variant: "default",
      });
      
      // Clear selection and refresh products
      setSelectedRows({});
      fetchProducts();
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products. Please try again.",
        variant: "destructive",
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
          onClick={() => handleBulkStatusUpdate('Active')}
          disabled={bulkActionLoading}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Set Active
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleBulkStatusUpdate('Out of Stock')}
          disabled={bulkActionLoading}
        >
          <Archive className="h-4 w-4 mr-2" />
          Set Out of Stock
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleBulkDelete}
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
          <option value="Apparel">Apparel</option>
          <option value="Accessories">Accessories</option>
          <option value="Footwear">Footwear</option>
          <option value="Outerwear">Outerwear</option>
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