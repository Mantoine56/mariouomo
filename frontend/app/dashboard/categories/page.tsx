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
  Trash2
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

export default function CategoriesPage() {
  // Initialize state
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No categories found. Create your first category to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>{category.totalProducts}</TableCell>
                          <TableCell>
                            <Badge variant={category.isVisible ? 'success' : 'secondary'}>
                              {category.isVisible ? 'Visible' : 'Hidden'}
                            </Badge>
                          </TableCell>
                          <TableCell>{category.position}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleVisibility(category.id, category.isVisible)}
                              >
                                {category.isVisible ? 'Hide' : 'Show'}
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCategory(category.id)}
                              >
                                Edit
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