/**
 * Category Products Manager Component
 * 
 * This component allows administrators to view, add, and remove products from a category.
 * It includes filtering, search, and bulk operations functionality.
 */
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  FileDown, 
  ChevronDown, 
  Loader2, 
  XCircle, 
  CheckCircle,
  MoveUpRight,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { ProductApi, Product, ProductSearchParams } from '@/lib/product-api';
import { CategoryApi, Category } from '@/lib/category-api';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { formatPrice } from '@/lib/utils';

// Define interface for component props
interface CategoryProductsManagerProps {
  categoryId: string;
  categoryName?: string;
}

/**
 * CategoryProductsManager component for managing products in a category
 */
export default function CategoryProductsManager({ categoryId, categoryName }: CategoryProductsManagerProps) {
  // Initialize APIs
  const productApi = new ProductApi();
  const categoryApi = new CategoryApi();
  const { toast } = useToast();

  // State for products and loading status
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Effect to load products
  useEffect(() => {
    loadProducts();
    loadCategoryProducts();
  }, [categoryId, pagination.page, searchQuery, filters]);

  /**
   * Loads products with current filters and pagination
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Build search parameters
      const searchParams: ProductSearchParams = {
        page: pagination.page,
        limit: pagination.limit,
        query: searchQuery,
        sortOrder: filters.sortOrder as any,
        sortBy: filters.sortBy as any
      };
      
      if (filters.status) {
        searchParams.status = filters.status;
      }
      
      if (filters.minPrice) {
        searchParams.minPrice = parseFloat(filters.minPrice);
      }
      
      if (filters.maxPrice) {
        searchParams.maxPrice = parseFloat(filters.maxPrice);
      }
      
      // Fetch products
      const response = await productApi.searchProducts(searchParams);
      
      // Update state with fetched data
      setProducts(response.items);
      setTotalProducts(response.total);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error loading products',
        description: 'Could not load products. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads products that are in this category
   */
  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would use a dedicated API endpoint
      // to fetch products in a specific category. For now, we'll use
      // a placeholder implementation that filters products by category metadata.
      const searchParams: ProductSearchParams = {
        limit: 100, // Get more items to ensure we capture all category products
        metadata: {
          category: categoryName
        }
      };
      
      const response = await productApi.searchProducts(searchParams);
      setCategoryProducts(response.items);
    } catch (error) {
      console.error('Error loading category products:', error);
      toast({
        title: 'Error loading category products',
        description: 'Could not load products in this category. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pagination change
   */
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  /**
   * Handles search query change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset pagination when search changes
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  /**
   * Handles search form submission
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  /**
   * Handles changing the selected status of a product
   */
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return newSelection;
    });
  };

  /**
   * Selects or deselects all products
   */
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      // Deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all displayed products
      const allIds = products.map(product => product.id);
      setSelectedProducts(new Set(allIds));
    }
  };

  /**
   * Checks if a product is in the category
   */
  const isProductInCategory = (productId: string) => {
    return categoryProducts.some(product => product.id === productId);
  };

  /**
   * Adds selected products to the category
   */
  const addSelectedProductsToCategory = async () => {
    try {
      setUpdating(true);
      
      // In a real implementation, you would call a specific API endpoint
      // to add multiple products to a category at once. For example:
      // await categoryApi.addProductsToCategory(categoryId, Array.from(selectedProducts));
      
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh product list after update
      await loadCategoryProducts();
      
      // Clear selection after successful operation
      setSelectedProducts(new Set());
      
      toast({
        title: 'Products added',
        description: `${selectedProducts.size} products were added to the category.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error adding products to category:', error);
      toast({
        title: 'Error adding products',
        description: 'Could not add products to the category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Removes selected products from the category
   */
  const removeSelectedProductsFromCategory = async () => {
    try {
      setUpdating(true);
      
      // In a real implementation, you would call a specific API endpoint
      // to remove multiple products from a category at once. For example:
      // await categoryApi.removeProductsFromCategory(categoryId, Array.from(selectedProducts));
      
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh product list after update
      await loadCategoryProducts();
      
      // Clear selection after successful operation
      setSelectedProducts(new Set());
      
      toast({
        title: 'Products removed',
        description: `${selectedProducts.size} products were removed from the category.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error removing products from category:', error);
      toast({
        title: 'Error removing products',
        description: 'Could not remove products from the category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Formats product status for display
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Manage Products</span>
          <div className="flex items-center gap-2">
            {selectedProducts.size > 0 && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={addSelectedProductsToCategory}
                  disabled={updating}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {updating ? 'Adding...' : 'Add to Category'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={removeSelectedProductsFromCategory}
                  disabled={updating}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  {updating ? 'Removing...' : 'Remove from Category'}
                </Button>
              </>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Assign products to this category or remove them
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search and filters */}
        <div className="mb-4 flex items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Status filter dropdown items would go here */}
                <DropdownMenuCheckboxItem
                  checked={filters.status === 'active'}
                  onCheckedChange={() => setFilters(prev => ({ ...prev, status: prev.status === 'active' ? '' : 'active' }))}
                >
                  Active Products
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === 'draft'}
                  onCheckedChange={() => setFilters(prev => ({ ...prev, status: prev.status === 'draft' ? '' : 'draft' }))}
                >
                  Draft Products
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === 'out_of_stock'}
                  onCheckedChange={() => setFilters(prev => ({ ...prev, status: prev.status === 'out_of_stock' ? '' : 'out_of_stock' }))}
                >
                  Out of Stock
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => loadProducts()}>
              <FileDown className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Products table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedProducts.size === products.length && products.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">In Category</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Loading products...</div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex justify-center">
                      <XCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">No products found</div>
                    <div className="mt-1">
                      <Button variant="link" onClick={() => {
                        setSearchQuery('');
                        setFilters({
                          status: '',
                          minPrice: '',
                          maxPrice: '',
                          sortBy: 'createdAt',
                          sortOrder: 'desc'
                        });
                      }}>Clear filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => {
                  const isInCategory = isProductInCategory(product.id);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-10 h-10 relative rounded-md overflow-hidden border">
                          <ImageWithFallback
                            src={(product.images && product.images.length > 0) ? product.images[0].url : ''}
                            alt={product.name}
                            fallbackSrc="/images/placeholder-product.png"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]">{product.name}</div>
                        {product.metadata?.category && (
                          <div className="text-xs text-muted-foreground">
                            {product.metadata.category}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{product.id.substring(0, 8)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell className="text-center">
                        {isInCategory ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Navigate to product edit page
                            window.open(`/dashboard/products/${product.id}`, '_blank');
                          }}
                        >
                          <MoveUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex items-center justify-between my-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, totalProducts)} of {totalProducts} products
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 