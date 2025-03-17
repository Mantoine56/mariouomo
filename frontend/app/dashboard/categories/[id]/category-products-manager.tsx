'use client';

import { useEffect, useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell
} from '@/components/ui/table';
import { DataTable } from '@/components/ui/table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Plus, Trash, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CategoryApi } from '@/lib/category-api';
import { ProductApi, ProductSortField, SortDirection } from '@/lib/product-api';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

const categoryApi = new CategoryApi();
const productApi = new ProductApi();

// Define our local product type that matches the database structure
interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  sku: string;
  stock_quantity: number;
  is_published: boolean;
}

interface Props {
  categoryId: string;
  categoryName?: string;
}

/**
 * CategoryProductsManager component
 * 
 * Provides an interface for managing products in a category,
 * including listing, adding, removing, and bulk operations.
 */
export function CategoryProductsManager({ categoryId }: Props) {
  const { toast } = useToast();
  
  // State for products in the category
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // State for adding products
  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedAvailableProducts, setSelectedAvailableProducts] = useState<Set<string>>(new Set());
  const [availableProductsLoading, setAvailableProductsLoading] = useState(false);
  const [availableProductsPage, setAvailableProductsPage] = useState(1);
  const [availableProductsTotalPages, setAvailableProductsTotalPages] = useState(1);
  const [availableProductsSearch, setAvailableProductsSearch] = useState('');
  const [availableProductsTotalCount, setAvailableProductsTotalCount] = useState(0);
  const [availableProductsLimit, setAvailableProductsLimit] = useState(10);
  
  // Load products in the category
  const loadCategoryProducts = async () => {
    setLoading(true);
    try {
      // Try to load products from API or database
      const response = await categoryApi.getCategoryProducts(categoryId, {
        page,
        limit,
        query: debouncedSearchQuery,
        sortBy: 'name', // Default sort by name
        sortDirection: 'ASC', // Default ascending order
      });
      
      // Update state with the loaded products
      setProducts(response.items || []);
      setTotalProducts(response.total || 0);
      setTotalPages(response.totalPages || 1);
      
      // Log the number of products loaded for debugging
      console.log(`Loaded ${response.items?.length || 0} products for category ${categoryId}`);
      
      // If no products are loaded, show a message
      if (!response.items || response.items.length === 0) {
        toast({
          title: "Info",
          description: "No products found in this category",
        });
      }
    } catch (error) {
      console.error('Failed to load category products:', error);
      toast({
        title: "Error",
        description: "Could not load category products",
        variant: "destructive",
      });
      
      // Set empty state on error
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  // Load all available products (those not in the category)
  const loadAvailableProducts = async () => {
    setAvailableProductsLoading(true);
    try {
      // Attempt to load all products from API
      const response = await productApi.searchProducts({
        page: availableProductsPage,
        limit: availableProductsLimit || 10,
        query: availableProductsSearch,
        sortBy: ProductSortField.NAME,
        sortOrder: SortDirection.ASC,
      });
      
      // Get IDs of products that are already in this category
      const currentProductIds = products.map(p => p.id);
      
      // Filter out products that are already in the category and map to local Product interface
      const availableItems = (response.items?.filter(
        (product: any) => !currentProductIds.includes(product.id)
      ) || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images?.[0]?.url,
        sku: product.sku || product.id.substring(0, 8), // Use part of ID if no SKU available
        stock_quantity: product.stock_quantity || 0, // Default to 0 if missing
        is_published: product.status === 'active' // Map status to is_published
      }));
      
      // Update state with available products
      setAvailableProducts(availableItems);
      setAvailableProductsTotalPages(response.totalPages || 1);
      setAvailableProductsTotalCount(response.total || 0);
      
      console.log(`Loaded ${availableItems.length} available products (filtered from ${response.items?.length || 0} total)`);
    } catch (error) {
      console.error('Failed to load available products:', error);
      toast({
        title: "Error",
        description: "Could not load available products",
        variant: "destructive",
      });
      
      // Set empty state on error
      setAvailableProducts([]);
      setAvailableProductsTotalPages(1);
      setAvailableProductsTotalCount(0);
    } finally {
      setAvailableProductsLoading(false);
    }
  };
  
  // Handle search input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Load products when page, limit, or search changes
  useEffect(() => {
    loadCategoryProducts();
  }, [categoryId, page, limit, debouncedSearchQuery]);
  
  // Load available products when opening the add products modal
  useEffect(() => {
    if (isAddingProducts) {
      loadAvailableProducts();
    } else {
      // Clear selection when closing the modal
      setSelectedAvailableProducts(new Set());
    }
  }, [isAddingProducts, availableProductsPage, availableProductsSearch]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    // DataTable uses 0-based index, we use 1-based
    setPage(newPage + 1);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing limit
  };
  
  // Select all products
  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      // If all are selected, deselect all
      setSelectedProducts(new Set());
    } else {
      // Otherwise, select all
      const allIds = products.map(product => product.id);
      setSelectedProducts(new Set(allIds));
    }
  };
  
  // Toggle selection of a product
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };
  
  // Add selected products to the category
  const addProductsToCategory = async () => {
    if (selectedAvailableProducts.size === 0) {
      toast({
        title: "Info",
        description: "No products selected to add",
      });
      return;
    }
    
    try {
      const productIds = Array.from(selectedAvailableProducts);
      await categoryApi.addProductsToCategory(categoryId, productIds);
      
      toast({
        title: "Success",
        description: `Added ${productIds.length} products to category`,
      });
      setIsAddingProducts(false);
      loadCategoryProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to add products to category:', error);
      toast({
        title: "Error",
        description: "Could not add products to category",
        variant: "destructive",
      });
    }
  };
  
  // Remove selected products from the category
  const removeProductsFromCategory = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Info",
        description: "No products selected to remove",
      });
      return;
    }
    
    try {
      const productIds = Array.from(selectedProducts);
      await categoryApi.removeProductsFromCategory(categoryId, productIds);
      
      toast({
        title: "Success",
        description: `Removed ${productIds.length} products from category`,
      });
      setSelectedProducts(new Set());
      loadCategoryProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove products from category:', error);
      toast({
        title: "Error", 
        description: "Could not remove products from category",
        variant: "destructive",
      });
    }
  };
  
  // Toggle selection of available product
  const toggleAvailableProductSelection = (productId: string) => {
    const newSelection = new Set(selectedAvailableProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedAvailableProducts(newSelection);
  };
  
  // Select all available products
  const selectAllAvailableProducts = () => {
    if (selectedAvailableProducts.size === availableProducts.length) {
      // If all are selected, deselect all
      setSelectedAvailableProducts(new Set());
    } else {
      // Otherwise, select all
      const allIds = availableProducts.map(product => product.id);
      setSelectedAvailableProducts(new Set(allIds));
    }
  };

  // Define columns for the DataTable
  const columns: ColumnDef<Product>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={selectedProducts.size === products.length && products.length > 0}
          onCheckedChange={selectAllProducts}
          aria-label="Select all products"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.has(row.original.id)}
          onCheckedChange={() => toggleProductSelection(row.original.id)}
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
    },
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => (
        row.original.image_url ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <ImageWithFallback
              src={row.original.image_url}
              alt={row.original.name}
              fallbackSrc="/images/placeholder-product.png"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No img</span>
          </div>
        )
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="text-right">
          ${typeof row.original.price === 'number' ? row.original.price.toFixed(2) : '0.00'}
        </div>
      ),
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ row }) => <div className="text-center">{row.original.stock_quantity}</div>,
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.is_published ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          )}
        </div>
      ),
    },
  ];
  
  // Render bulk actions when rows are selected
  const renderBulkActions = () => (
    <Button
      variant="destructive"
      size="sm"
      onClick={removeProductsFromCategory}
      className="flex items-center"
    >
      <Trash className="mr-2 h-4 w-4" />
      Remove selected
    </Button>
  );
  
  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 w-1/3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsAddingProducts(true)}
            size="sm"
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Products
          </Button>
        </div>
      </div>
      
      {/* Products Table using DataTable component */}
      <div className="rounded-md border">
        {loading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            {debouncedSearchQuery ? (
              <div>
                <p>No products found matching &quot;{debouncedSearchQuery}&quot;</p>
              </div>
            ) : (
              <div className="text-center">
                <p>No products in this category yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsAddingProducts(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add products
                </Button>
              </div>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            totalItems={totalProducts}
            currentPage={page - 1} // Convert 1-based to 0-based for DataTable
            pageSize={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            enableRowSelection={true}
            selectedRows={Object.fromEntries(Array.from(selectedProducts).map(id => [id, true]))}
            onSelectedRowsChange={(rows) => setSelectedProducts(new Set(Object.keys(rows)))}
            renderBulkActions={renderBulkActions}
          />
        )}
      </div>
      
      {/* Add Products Modal */}
      {isAddingProducts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Products to Category</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingProducts(false)}
              >
                &times;
              </Button>
            </div>
            
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-2 w-1/3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available products..."
                  value={availableProductsSearch}
                  onChange={(e) => setAvailableProductsSearch(e.target.value)}
                  className="h-9"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedAvailableProducts.size > 0 && (
                  <Button
                    onClick={addProductsToCategory}
                    size="sm"
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add {selectedAvailableProducts.size} selected
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAvailableProducts.size === availableProducts.length && availableProducts.length > 0}
                          onCheckedChange={selectAllAvailableProducts}
                          aria-label="Select all available products"
                        />
                      </TableHead>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableProductsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">Loading available products...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : availableProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {availableProductsSearch ? (
                            <div>
                              <p>No available products found matching &quot;{availableProductsSearch}&quot;</p>
                            </div>
                          ) : (
                            <div>
                              <p>All products are already in this category.</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      availableProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedAvailableProducts.has(product.id)}
                              onCheckedChange={() => toggleAvailableProductSelection(product.id)}
                              aria-label={`Select ${product.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            {product.image_url ? (
                              <div className="relative h-10 w-10 rounded-md overflow-hidden">
                                <ImageWithFallback
                                  src={product.image_url}
                                  alt={product.name}
                                  fallbackSrc="/images/placeholder-product.png"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No img</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell className="text-right">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.stock_quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.is_published ? (
                              <Badge variant="success">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination for available products */}
              {!availableProductsLoading && availableProducts.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={availableProductsPage}
                    totalPages={availableProductsTotalPages}
                    onPageChange={setAvailableProductsPage}
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddingProducts(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={addProductsToCategory}
                disabled={selectedAvailableProducts.size === 0}
              >
                Add {selectedAvailableProducts.size} Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 