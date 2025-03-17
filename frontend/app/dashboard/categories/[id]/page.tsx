'use client';

/**
 * Category Edit Page
 * 
 * This page allows administrators to create new categories or edit existing ones.
 * It handles category details, SEO settings, and image uploads.
 */
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, TextQuote, Eye, EyeOff, X, Package, Boxes } from 'lucide-react';
import { CategoryApi, Category } from '@/lib/category-api';
import { ImageUpload, UploadedImage } from '@/components/ui/image-upload';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import CategoryPreview from '@/components/dashboard/CategoryPreview';
import { CategoryProductsManager } from './category-products-manager';

export default function CategoryEditPage() {
  // Get category ID from URL params
  const params = useParams();
  const categoryId = params.id as string;
  const isNewCategory = categoryId === 'new';
  
  // Initialize state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isVisible: true,
    position: 0,
    seoMetadata: {
      title: '',
      description: '',
      keywords: []
    }
  });
  const [availableParentCategories, setAvailableParentCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();
  const { toast } = useToast();
  const categoryApi = new CategoryApi();

  // Load category data if editing an existing category
  useEffect(() => {
    loadAvailableParentCategories();
    
    if (!isNewCategory) {
      loadCategory();
    } else {
      setLoading(false);
    }
  }, [categoryId]);

  /**
   * Load available parent categories for the dropdown
   */
  const loadAvailableParentCategories = async () => {
    try {
      const categories = await categoryApi.getCategories();
      
      // If editing an existing category, filter out the current category and its descendants
      // to prevent circular references
      if (!isNewCategory) {
        // For simplicity, just filter out the current category
        const filteredCategories = categories.filter(c => c.id !== categoryId);
        setAvailableParentCategories(filteredCategories);
      } else {
        setAvailableParentCategories(categories);
      }
    } catch (error) {
      console.error('Error loading parent categories:', error);
      toast({
        title: 'Error loading parent categories',
        description: 'Could not load available parent categories. Some options may be missing.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Load category data for editing
   */
  const loadCategory = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in the CategoryApi class
      const fetchedCategory = await categoryApi.getCategoryById(categoryId);
      setCategory(fetchedCategory);
      
      // Initialize uploaded images if the category has an image URL
      if (fetchedCategory.imageUrl) {
        setUploadedImages([{
          id: `existing-${fetchedCategory.id}`,
          url: fetchedCategory.imageUrl,
          name: 'Category Image',
          size: 0
        }]);
      } else {
        // Ensure uploaded images is empty if no image URL
        setUploadedImages([]);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      toast({
        title: 'Error loading category',
        description: 'Could not load category data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields (seoMetadata)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'seoMetadata') {
        setCategory(prev => ({
          ...prev,
          seoMetadata: {
            ...prev.seoMetadata,
            [child]: value
          }
        }));
      }
    } else {
      setCategory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Handle checkbox changes
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  /**
   * Save category
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      // Use the first uploaded image as the category image URL
      let updatedCategory = { ...category };
      if (uploadedImages.length > 0) {
        updatedCategory.imageUrl = uploadedImages[0].url;
      } else {
        // Explicitly set to null rather than undefined to ensure it's included in API request
        updatedCategory.imageUrl = null;
      }
      
      // Debug log for image deletion
      console.log('Saving category with image status:', { 
        hasUploadedImages: uploadedImages.length > 0,
        imageUrl: updatedCategory.imageUrl
      });
      
      if (isNewCategory) {
        await categoryApi.createCategory(updatedCategory as Category);
        toast({
          title: 'Category created',
          description: 'The category has been created successfully.',
        });
      } else {
        await categoryApi.updateCategory(categoryId, updatedCategory);
        toast({
          title: 'Category updated',
          description: 'The category has been updated successfully.',
        });
      }
      
      // Navigate back to categories list
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error saving category',
        description: 'Could not save category. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Generate slug from name
   */
  const generateSlug = () => {
    if (!category.name) return;
    
    const slug = category.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special chars
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Remove consecutive hyphens
    
    setCategory(prev => ({
      ...prev,
      slug
    }));
  };

  /**
   * Handle keywords input (comma-separated list)
   */
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywordsString = e.target.value;
    // Split by comma and trim whitespace
    const keywordsArray = keywordsString.split(',').map(k => k.trim());
    
    setCategory(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        keywords: keywordsArray
      }
    }));
  };

  /**
   * Handle image uploads
   */
  const handleImageChange = (images: UploadedImage[]) => {
    // Categories only need one image, so we'll use the most recently added one
    setUploadedImages(images.length > 0 ? [images[images.length - 1]] : []);
  };

  /**
   * Handle deletion of the current image
   */
  const handleDeleteImage = () => {
    // Clear uploaded images
    setUploadedImages([]);
    
    // Also update the category state to ensure persistence
    setCategory(prev => ({
      ...prev,
      imageUrl: undefined
    }));
    
    toast({
      title: 'Image removed',
      description: 'The category image has been removed. Remember to save your changes.',
    });
  };

  /**
   * Open image lightbox
   */
  const openLightbox = () => {
    if (uploadedImages.length > 0) {
      setLightboxOpen(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewCategory ? 'Create New Category' : `Edit Category: ${category.name}`}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Category'}
        </Button>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">
            <TextQuote className="h-4 w-4 mr-2" />
            Basic Details
          </TabsTrigger>
          <TabsTrigger value="seo">
            <TextQuote className="h-4 w-4 mr-2" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="h-4 w-4 mr-2" />
            Category Image
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="products">
            <Boxes className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Basic information about the category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name input */}
              <div className="grid gap-2">
                <label htmlFor="name" className="font-medium">
                  Category Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={category.name || ''}
                  onChange={handleChange}
                  onBlur={!category.slug ? generateSlug : undefined}
                  className="border rounded-md p-2"
                  placeholder="e.g. Men's Clothing"
                />
              </div>

              {/* Slug input */}
              <div className="grid gap-2">
                <label htmlFor="slug" className="font-medium">
                  Slug
                </label>
                <div className="flex gap-2">
                  <input
                    id="slug"
                    name="slug"
                    value={category.slug || ''}
                    onChange={handleChange}
                    className="border rounded-md p-2 flex-1"
                    placeholder="e.g. mens-clothing"
                  />
                  <Button variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Used in URLs: /categories/{category.slug || 'example-slug'}
                </p>
              </div>

              {/* Description textarea */}
              <div className="grid gap-2">
                <label htmlFor="description" className="font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={category.description || ''}
                  onChange={handleChange}
                  className="border rounded-md p-2 min-h-[100px]"
                  placeholder="Describe this category..."
                />
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  name="isVisible"
                  checked={category.isVisible}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
                <label htmlFor="isVisible" className="font-medium">
                  {category.isVisible ? (
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-green-500" />
                      Visible to customers
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                      Hidden from customers
                    </span>
                  )}
                </label>
              </div>

              {/* Position input */}
              <div className="grid gap-2">
                <label htmlFor="position" className="font-medium">
                  Display Order
                </label>
                <input
                  type="number"
                  id="position"
                  name="position"
                  value={category.position || 0}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-32"
                  min="0"
                />
                <p className="text-sm text-gray-500">
                  Lower numbers appear first in navigation
                </p>
              </div>

              {/* Parent category select - populated with available categories */}
              <div className="grid gap-2">
                <label htmlFor="parentId" className="font-medium">
                  Parent Category
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={category.parentId || ''}
                  onChange={handleChange}
                  className="border rounded-md p-2"
                >
                  <option value="">None (Top Level Category)</option>
                  {availableParentCategories.map(parentCategory => (
                    <option key={parentCategory.id} value={parentCategory.id}>
                      {parentCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize this category for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SEO Title */}
              <div className="grid gap-2">
                <label htmlFor="seoMetadata.title" className="font-medium">
                  SEO Title
                </label>
                <input
                  id="seoMetadata.title"
                  name="seoMetadata.title"
                  value={category.seoMetadata?.title || ''}
                  onChange={handleChange}
                  className="border rounded-md p-2"
                  placeholder="Optimized page title"
                />
                <p className="text-sm text-gray-500">
                  Leave blank to use category name
                </p>
              </div>

              {/* SEO Description */}
              <div className="grid gap-2">
                <label htmlFor="seoMetadata.description" className="font-medium">
                  Meta Description
                </label>
                <textarea
                  id="seoMetadata.description"
                  name="seoMetadata.description"
                  value={category.seoMetadata?.description || ''}
                  onChange={handleChange}
                  className="border rounded-md p-2 min-h-[100px]"
                  placeholder="Brief description for search results"
                />
                <p className="text-sm text-gray-500">
                  Recommended: 150-160 characters
                </p>
              </div>

              {/* Keywords */}
              <div className="grid gap-2">
                <label htmlFor="keywords" className="font-medium">
                  Keywords
                </label>
                <input
                  id="keywords"
                  name="keywords"
                  value={category.seoMetadata?.keywords?.join(', ') || ''}
                  onChange={handleKeywordsChange}
                  className="border rounded-md p-2"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-gray-500">
                  Comma-separated list of keywords
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>
                Upload an image to represent this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current category image preview */}
              {uploadedImages.length > 0 && (
                <div className="mb-6 border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Current Image</p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteImage}
                    >
                      Remove Image
                    </Button>
                  </div>
                  <div 
                    className="relative w-full h-48 overflow-hidden rounded-md border mb-3 cursor-pointer"
                    onClick={openLightbox}
                  >
                    <ImageWithFallback
                      src={uploadedImages[0].url}
                      alt={category.name || 'Category image'}
                      fill
                      className="object-cover hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                      <span className="bg-white text-black px-3 py-1 rounded-md text-sm font-medium">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Image upload component */}
              <div className={uploadedImages.length > 0 ? 'border-t pt-4 mt-4' : ''}>
                <p className="font-medium mb-2">
                  {uploadedImages.length > 0 ? 'Replace Image' : 'Upload Image'}
                </p>
                <ImageUpload
                  value={uploadedImages}
                  onChange={handleImageChange}
                  maxImages={1}
                  bucket="product-images"
                />
                
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 1200 x 800 pixels. Max file size: 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <CategoryPreview category={category} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <CategoryProductsManager 
            categoryId={params.id.toString()} 
            categoryName={category.name} 
          />
        </TabsContent>
      </Tabs>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-1 bg-transparent border-none">
          <VisuallyHidden>
            <DialogTitle>Category Image Preview</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
            <Button
              variant="outline" 
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {uploadedImages.length > 0 && (
              <div className="relative w-full h-[80vh]">
                <ImageWithFallback
                  src={uploadedImages[0].url}
                  alt={category.name || 'Category image'}
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 