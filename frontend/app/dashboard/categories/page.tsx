'use client';

/**
 * Categories Management Page
 * 
 * Displays a list of categories with their stats and properties
 * Initial implementation with basic functionality
 */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { 
  FolderTree, 
  Plus, 
  Loader2, 
  List, 
  Eye, 
  EyeOff,
  Package,
  ChevronRight,
  MoreHorizontal,
  ChevronsUpDown,
  Edit,
  Trash2,
  Search,
  Filter,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CategoryApi, Category } from '@/lib/category-api';
import { useToast } from '@/components/ui/use-toast';
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
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

// Sorting types
type SortField = 'name' | 'slug' | 'totalProducts' | 'isVisible' | 'position';
type SortDirection = 'asc' | 'desc';

export default function CategoriesPage() {
  // Initialize state
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [productCountFilter, setProductCountFilter] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const { toast } = useToast();
  const router = useRouter();
  const categoryApi = new CategoryApi();

  // Load categories when component mounts and also when the focus returns to the window
  useEffect(() => {
    loadCategories();
    
    // Refresh category data when user comes back to this page
    const handleFocus = () => {
      console.log("Window focused, refreshing category data");
      loadCategories();
    };
    
    // Add focus event listener
    window.addEventListener('focus', handleFocus);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Load category tree when tree tab is selected
  useEffect(() => {
    if (activeTab === 'tree' && categoryTree.length === 0) {
      loadCategoryTree();
    }
  }, [activeTab, categoryTree.length]);

  /**
   * Filter and sort categories based on search query, filters, and sorting
   */
  useEffect(() => {
    if (!categories.length) {
      setFilteredCategories([]);
      return;
    }
    
    let result = [...categories];
    
    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(category => 
        category.name.toLowerCase().includes(lowercaseQuery) || 
        category.slug.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      const isVisible = visibilityFilter === 'visible';
      result = result.filter(category => category.isVisible === isVisible);
    }
    
    // Apply product count filter
    if (productCountFilter !== 'all') {
      switch (productCountFilter) {
        case 'with-products':
          result = result.filter(category => category.totalProducts > 0);
          break;
        case 'empty':
          result = result.filter(category => category.totalProducts === 0);
          break;
        case 'many-products':
          result = result.filter(category => category.totalProducts >= 10);
          break;
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      // Convert fields for proper comparison
      const aValue = a[sortField as keyof Category];
      const bValue = b[sortField as keyof Category];
      
      // Handle different types of values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCategories(result);
  }, [categories, searchQuery, visibilityFilter, productCountFilter, sortField, sortDirection]);
  
  /**
   * Handle sorting when a table header is clicked
   */
  const handleSort = (field: SortField) => {
    // If clicking on the currently sorted field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking on a different field, sort ascending by that field
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  /**
   * Render sort indicator for a table header
   */
  const renderSortIndicator = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setSearchQuery('');
    setVisibilityFilter('all');
    setProductCountFilter('all');
  };

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    setLoading(true);
    try {
      // Force update of product counts first
      await updateCategoryProductCounts();
      
      // Then fetch categories with updated counts
      const fetchedCategories = await categoryApi.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      // Only log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading categories:', error);
      }
      
      toast({
        title: 'Error loading categories',
        description: 'Could not load categories. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update category product counts in the database
   */
  const updateCategoryProductCounts = async (): Promise<void> => {
    try {
      // Check if backend API is available
      const isBackendAvailable = await categoryApi.isBackendAvailable();
      
      if (isBackendAvailable) {
        console.log("Updating category product counts via API");
        await categoryApi.updateCategoryProductCounts();
      } else {
        console.log("Backend API not available, skipping product count update");
      }
    } catch (error) {
      console.error("Error updating category product counts:", error);
      // Don't show a toast here - we don't want to alarm the user for background operations
    }
  };

  /**
   * Load category tree from API
   */
  const loadCategoryTree = async () => {
    setLoading(true);
    try {
      const fetchedCategoryTree = await categoryApi.getCategoryTree();
      setCategoryTree(fetchedCategoryTree);
      
      // Initialize open state for categories with children
      const initialOpenState: Record<string, boolean> = {};
      fetchedCategoryTree.forEach(category => {
        if (category.children && category.children.length > 0) {
          initialOpenState[category.id] = true; // Start with all top-level categories open
        }
      });
      setOpenCategories(initialOpenState);
    } catch (error) {
      // Only log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading category tree:', error);
      }
      
      toast({
        title: 'Error loading category tree',
        description: 'Could not load category hierarchy. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to edit page for a category
   */
  const handleEditCategory = (categoryId: string) => {
    router.push(`/dashboard/categories/${categoryId}`);
  };

  /**
   * Navigate to create new category page
   */
  const handleCreateCategory = () => {
    router.push('/dashboard/categories/new');
  };

  /**
   * Toggle category visibility (placeholder function)
   */
  const toggleVisibility = async (categoryId: string, isCurrentlyVisible: boolean) => {
    // This is a placeholder - would need to be implemented when adding full CRUD
    toast({
      title: `Category ${isCurrentlyVisible ? 'hidden' : 'shown'}`,
      description: `The category visibility has been updated`,
    });
  };

  /**
   * Delete category (placeholder function)
   */
  const deleteCategory = async (categoryId: string) => {
    // This is a placeholder - would need to be implemented when adding full CRUD
    toast({
      title: 'Not implemented',
      description: 'Category deletion will be implemented in a future update',
      variant: 'destructive',
    });
  };

  /**
   * Toggle a category's expanded state in the tree view
   */
  const toggleCategoryOpen = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  /**
   * Render a category and its children recursively in the tree view
   */
  const renderCategoryTree = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isOpen = openCategories[category.id] || false;
    
    return (
      <div key={category.id} className="category-tree-item">
        <Collapsible
          open={isOpen}
          onOpenChange={() => toggleCategoryOpen(category.id)}
          className="border-b border-gray-100 last:border-0"
        >
          <div className={cn(
            "flex items-center gap-2 py-2 hover:bg-gray-50 rounded-md",
            depth > 0 && `pl-${depth * 6}`
          )}>
            {hasChildren ? (
              <CollapsibleTrigger className="flex items-center">
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-90"
                )} />
              </CollapsibleTrigger>
            ) : (
              <span className="w-4" />
            )}
            
            <span className={cn("font-medium", !hasChildren && "ml-4")}>{category.name}</span>
            
            <Badge 
              variant={category.isVisible ? 'success' : 'secondary'} 
              className="ml-2"
            >
              {category.isVisible ? 'Visible' : 'Hidden'}
            </Badge>
            
            <span className="ml-auto text-sm text-gray-500">{category.totalProducts} products</span>
            
            <div className="flex items-center gap-1 ml-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditCategory(category.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleVisibility(category.id, category.isVisible)}
              >
                {category.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {hasChildren && (
            <CollapsibleContent>
              <div className="ml-4 pl-2 border-l border-gray-200">
                {category.children?.map(child => renderCategoryTree(child, depth + 1))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button className="ml-auto" onClick={handleCreateCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Categories"
          value={categories.length.toString()}
          icon={<FolderTree className="h-5 w-5 text-primary" />}
          description="Total number of categories"
          variant="primary"
        />
        <StatCard
          title="Visible Categories"
          value={categories.filter(c => c.isVisible).length.toString()}
          icon={<Eye className="h-5 w-5 text-green-500" />}
          description="Categories visible to customers"
          variant="success"
        />
        <StatCard
          title="Hidden Categories"
          value={categories.filter(c => !c.isVisible).length.toString()}
          icon={<EyeOff className="h-5 w-5 text-amber-500" />}
          description="Categories hidden from customers"
          variant="warning"
        />
        <StatCard
          title="Total Products"
          value={categories.reduce((sum, cat) => sum + cat.totalProducts, 0).toString()}
          icon={<Package className="h-5 w-5 text-blue-500" />}
          description="Products across all categories"
          variant="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>View and manage your product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Visibility filter */}
            <div className="relative">
              <select
                className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
              >
                <option value="all">All Visibility</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
            
            {/* Product count filter */}
            <div className="relative">
              <select
                className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                value={productCountFilter}
                onChange={(e) => setProductCountFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="with-products">With Products</option>
                <option value="empty">Empty Categories</option>
                <option value="many-products">10+ Products</option>
              </select>
            </div>
            
            {/* Reset filters button */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center"
                disabled={!searchQuery && visibilityFilter === 'all' && productCountFilter === 'all'}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="tree">
                <FolderTree className="mr-2 h-4 w-4" />
                Tree View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <div>
                  {/* Show filtered count */}
                  {(searchQuery || visibilityFilter !== 'all' || productCountFilter !== 'all') && (
                    <div className="mb-2 text-sm text-muted-foreground">
                      <p>
                        Showing {filteredCategories.length} of {categories.length} categories
                        {searchQuery ? ` matching "${searchQuery}"` : ''}
                      </p>
                    </div>
                  )}
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            {renderSortIndicator('name')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('slug')}
                        >
                          <div className="flex items-center">
                            Slug
                            {renderSortIndicator('slug')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('totalProducts')}
                        >
                          <div className="flex items-center">
                            Products
                            {renderSortIndicator('totalProducts')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('isVisible')}
                        >
                          <div className="flex items-center">
                            Visibility
                            {renderSortIndicator('isVisible')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('position')}
                        >
                          <div className="flex items-center">
                            Position
                            {renderSortIndicator('position')}
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {categories.length === 0 ? (
                              <div>
                                <p className="text-muted-foreground">No categories found</p>
                                <Button
                                  variant="link"
                                  onClick={handleCreateCategory}
                                  className="mt-2"
                                >
                                  Create your first category
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <p className="text-muted-foreground">No categories match your filters</p>
                                <Button
                                  variant="link"
                                  onClick={resetFilters}
                                  className="mt-2"
                                >
                                  Reset filters
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map(category => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.slug}</TableCell>
                            <TableCell>{category.totalProducts}</TableCell>
                            <TableCell>
                              <Badge
                                variant={category.isVisible ? 'success' : 'secondary'}
                              >
                                {category.isVisible ? 'Visible' : 'Hidden'}
                              </Badge>
                            </TableCell>
                            <TableCell>{category.position}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditCategory(category.id)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleVisibility(category.id, category.isVisible)}
                                >
                                  {category.isVisible ? 'Hide' : 'Show'}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteCategory(category.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tree" className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span>Loading category tree...</span>
                </div>
              ) : (
                <div className="border rounded-md">
                  {categoryTree.length === 0 ? (
                    <p className="text-center py-8">
                      No categories found in tree view.
                    </p>
                  ) : (
                    <div className="category-tree p-4">
                      <div className="flex items-center gap-2 pb-2 font-semibold border-b mb-2">
                        <span className="flex-1">Category Name</span>
                        <span className="w-24 text-right">Products</span>
                        <span className="w-40 text-right">Actions</span>
                      </div>
                      {categoryTree.map(category => renderCategoryTree(category))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 