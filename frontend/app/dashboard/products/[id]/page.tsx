/**
 * Product Detail Page
 * 
 * This page displays detailed information about a product and allows editing
 */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Edit, Trash, Share2, Clock, DollarSign, ShoppingCart, Tag, LayoutGrid, X, ChevronLeft, ChevronRight, Info, Maximize2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProductForm } from "../components/product-form";
import { Product, ProductApi, ProductImage } from "@/lib/product-api";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ImageWithFallback from "@/components/ui/image-with-fallback";

// Create ProductApi instance
const productApi = new ProductApi();

// Helper function to format product status with appropriate color
const getStatusBadgeVariant = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'active') return 'success';
  if (statusLower === 'draft') return 'secondary';
  if (statusLower === 'inactive' || statusLower === 'out of stock') return 'destructive';
  if (statusLower === 'low stock') return 'warning';
  return 'outline';
};

/**
 * Product detail page for viewing and editing a product
 * Fetches product data based on the ID from the URL
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get product ID from URL params
  const productId = params.id as string;

  // Add function to redirect to similar product ID if needed
  const checkAndRedirectToSimilarProduct = async (id: string) => {
    try {
      // Check if we're already trying to redirect to avoid infinite loops
      const isRedirecting = sessionStorage.getItem('redirecting');
      if (isRedirecting === 'true') {
        console.log('Already redirecting, preventing infinite loop');
        sessionStorage.removeItem('redirecting');
        return false;
      }

      // If the product can't be loaded, try to see if there's a similar ID with a common typo
      // (e.g., '4f7c' vs '47fc' in bd5e0168-6a2e-47fc-b444-841e6721f97c)
      const similarIds = await productApi.findSimilarProductIds(id);
      
      if (similarIds.length > 0) {
        console.log(`Found similar product ID: ${similarIds[0]}, redirecting...`);
        // Set flag to prevent infinite redirect loops
        sessionStorage.setItem('redirecting', 'true');
        // Redirect to the correct product page
        router.push(`/dashboard/products/${similarIds[0]}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for similar products:', error);
      return false;
    }
  };

  // Function to open the image modal
  const openImageModal = (index: number) => {
    console.log(`Opening image modal with index: ${index}`);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  // Function to navigate to next image in modal
  const nextImage = () => {
    if (!product?.images) return;
    const validImages = product.images.filter(img => !!img.original_url || !!img.thumbnail_url || !!img.url);
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % validImages.length);
  };

  // Function to navigate to previous image in modal
  const prevImage = () => {
    if (!product?.images) return;
    const validImages = product.images.filter(img => !!img.original_url || !!img.thumbnail_url || !!img.url);
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + validImages.length) % validImages.length);
  };

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProduct(productId);
        console.log('Fetched product data:', data);
        if (data.images) {
          console.log(`Product has ${data.images.length} images:`, data.images);
        }
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data');
        
        // If product isn't found, try to find a similar product ID and redirect
        const redirected = await checkAndRedirectToSimilarProduct(productId);
        if (!redirected) {
          // Only show error if we're not redirecting
          setError('Failed to load product data. The product may not exist.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  // Refresh product data when returning from edit mode
  useEffect(() => {
    if (!isEditMode && productId) {
      const refreshProductData = async () => {
        try {
          const data = await productApi.getProduct(productId);
          console.log('Refreshed product data after editing:', data);
          setProduct(data);
        } catch (err) {
          console.error('Error refreshing product data:', err);
        }
      };
      
      refreshProductData();
    }
  }, [isEditMode, productId]);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Save updated product data
      const updatedProduct = await productApi.updateProduct(productId, data);
      
      // If the updatedProduct is empty (just { success: true }), we need to refetch the product
      if (!updatedProduct.id) {
        // Refetch the full product data
        const refreshedProduct = await productApi.getProduct(productId);
        setProduct(refreshedProduct);
      } else {
        setProduct(updatedProduct);
      }
      
      setIsEditMode(false);
      toast.success('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
      throw err; // Re-throw to let the form handle the error state
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productApi.deleteProduct(productId);
      toast.success('Product deleted successfully');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Details</h1>
          <Link
            href="/dashboard/products"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>
        <DashboardCard>
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardCard>
      </div>
    );
  }

  // Handle error state or product not found
  if (error || !product) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
          <Link
            href="/dashboard/products"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Product Not Found</h2>
            <p className="mt-2 text-center text-muted-foreground">
              {error || "The product you are looking for does not exist or has been removed."}
            </p>
            <Link
              href="/dashboard/products/new"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create New Product
            </Link>
          </div>
        </DashboardCard>
      </div>
    );
  }

  // Show edit form if edit mode is active
  if (isEditMode) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditMode(false)}
            >
              Cancel
            </Button>
            <Link
              href="/dashboard/products"
              className="flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </div>
        <DashboardCard>
          <ProductForm initialData={product} onSubmit={handleSubmit} />
        </DashboardCard>
      </div>
    );
  }

  // Get the primary image or use a placeholder
  const getValidImageUrl = (images: ProductImage[] | undefined): string => {
    if (!images || images.length === 0) {
      console.log('No product images found, using placeholder');
      return '/images/product-placeholder.svg';
    }
    
    // Log all available images for debugging
    console.log(`Found ${images.length} product images:`);
    images.forEach((img, index) => {
      const originalUrl = img.original_url || '';
      const thumbnailUrl = img.thumbnail_url || '';
      const url = img.url || '';
      
      console.log(`Image ${index + 1}:`, { 
        id: img.id,
        url: url || 'No URL',
        original_url: originalUrl || 'No original_url',
        thumbnail_url: thumbnailUrl || 'No thumbnail_url'
      });
    });
    
    // Find the first image with any valid URL
    const imageWithValidUrl = images.find(img => !!img.original_url || !!img.thumbnail_url || !!img.url);
    if (imageWithValidUrl) {
      const imageUrl = imageWithValidUrl.original_url || imageWithValidUrl.thumbnail_url || imageWithValidUrl.url;
      console.log(`Using image with URL: ${imageUrl}`);
      return imageUrl || '/images/product-placeholder.svg';
    }
    
    // No valid images found, use placeholder
    console.warn('No images with valid URLs found, using placeholder');
    return '/images/product-placeholder.svg';
  };
  
  const mainImage = getValidImageUrl(product.images);
  
  // Format product status with graceful fallback
  const statusDisplay = product.status 
    ? product.status.charAt(0).toUpperCase() + product.status.slice(1) 
    : 'Unknown';
  
  // Get product category with fallback
  const category = product.metadata?.category || 'Uncategorized';
  
  // Calculate profit margin if cost price is available
  const costPrice = product.cost_price || 0;
  const profit = product.price - costPrice;
  const profitMargin = product.price > 0 ? (profit / product.price) * 100 : 0;

  // Get valid images only once for use in multiple places
  const validImages = product?.images?.filter(img => !!img.original_url || !!img.thumbnail_url || !!img.url) || [];
  
  // Log valid images for debugging
  console.log(`[DEBUG] Found ${validImages.length} valid images:`, validImages.map(img => ({
    id: img.id,
    url: img.url,
    original_url: img.original_url,
    thumbnail_url: img.thumbnail_url
  })));

  return (
    <div className="flex flex-col space-y-6 p-8">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <Badge variant={getStatusBadgeVariant(product.status)}>
            {statusDisplay}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.navigator.clipboard.writeText(window.location.href)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </div>
      </div>

      {/* Product detail content */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          
          // Refresh product data when switching to images tab
          if (value === 'images' && productId) {
            const refreshProductData = async () => {
              try {
                const data = await productApi.getProduct(productId);
                console.log('Refreshed product data for images tab:', data);
                setProduct(data);
              } catch (err) {
                console.error('Error refreshing product data:', err);
              }
            };
            
            refreshProductData();
          }
        }}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Product Image */}
            <DashboardCard className="col-span-1">
              <div className="flex flex-col items-center justify-center p-4">
                {/* Add product image gallery for main display */}
                <div className="flex flex-col space-y-4 w-full">
                  {/* Main product image */}
                  <div 
                    className="relative h-64 w-full overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    onClick={() => validImages.length > 0 && openImageModal(0)}
                  >
                    <ImageWithFallback 
                      src={mainImage !== '/images/product-placeholder.svg' ? mainImage : undefined}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-2"
                      fallbackSrc="/images/product-placeholder.svg"
                    />
                  </div>
                  
                  {/* Thumbnail gallery if there are multiple images */}
                  {validImages.length > 1 ? (
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {validImages
                        .slice(0, 5) // Show max 5 thumbnails to prevent overflow
                        .map((image, index) => (
                          <div 
                            key={image.id || index}
                            className="relative w-16 h-16 overflow-hidden rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 dark:bg-gray-800"
                            onClick={() => openImageModal(index)}
                          >
                            <ImageWithFallback
                              src={image?.original_url ?? image?.thumbnail_url ?? image?.url ?? undefined}
                              alt={`Product image ${index + 1}`}
                              fill
                              style={{ objectFit: 'contain' }}
                              className="p-1"
                              fallbackSrc="/images/product-placeholder.svg"
                            />
                          </div>
                        ))
                      }
                      
                      {/* If there are more than 5 images, show a "+X more" button */}
                      {validImages.length > 5 && (
                        <div 
                          className="relative w-16 h-16 overflow-hidden rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-primary/10 flex items-center justify-center text-xs font-medium"
                          onClick={() => setActiveTab('images')}
                        >
                          +{validImages.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <span className="mt-4 text-sm text-muted-foreground">
                  {validImages.length || 0} 
                  Image{validImages.length !== 1 ? 's' : ''}
                </span>
                
                {/* Show "View all images" button if there are multiple images */}
                {validImages.length > 1 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('images')}
                  >
                    View all images
                  </Button>
                )}
              </div>
            </DashboardCard>

            {/* Product Info */}
            <DashboardCard className="col-span-1 md:col-span-2">
              <div className="flex flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={getStatusBadgeVariant(product.status)} className="w-fit">
                      {statusDisplay}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium">{formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(product.updated_at)}</span>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="mb-4">
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </DashboardCard>

            {/* Key Metrics */}
            <DashboardCard className="col-span-1 md:col-span-3">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Product Metrics</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Price */}
                  <div className="flex items-center rounded-lg border p-4">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  
                  {/* Cost & Profit */}
                  <div className="flex items-center rounded-lg border p-4">
                    <div className="mr-4 rounded-full bg-green-100 p-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-lg font-bold">
                        {profitMargin.toFixed(1)}%
                        <span className="text-sm text-muted-foreground ml-1">
                          ({formatCurrency(profit)})
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="flex items-center rounded-lg border p-4">
                    <div className="mr-4 rounded-full bg-blue-100 p-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg font-bold">{category}</p>
                    </div>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-center rounded-lg border p-4">
                    <div className="mr-4 rounded-full bg-purple-100 p-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-lg font-bold">{formatDate(product.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <DashboardCard>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Product Details</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium">Basic Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Product ID</dt>
                      <dd className="font-medium">{product.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Name</dt>
                      <dd className="font-medium">{product.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Price</dt>
                      <dd className="font-medium">{formatCurrency(product.price)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Status</dt>
                      <dd>
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {statusDisplay}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Category</dt>
                      <dd className="font-medium">{category}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="mb-3 font-medium">Pricing & Inventory</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Base Price</dt>
                      <dd className="font-medium">{formatCurrency(product.price)}</dd>
                    </div>
                    {product.compare_at_price && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Compare At Price</dt>
                        <dd className="font-medium">{formatCurrency(product.compare_at_price)}</dd>
                      </div>
                    )}
                    {product.cost_price && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Cost Price</dt>
                        <dd className="font-medium">{formatCurrency(product.cost_price)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Profit</dt>
                      <dd className="font-medium">{formatCurrency(profit)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Profit Margin</dt>
                      <dd className="font-medium">{profitMargin.toFixed(1)}%</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <h4 className="mb-3 font-medium">Description</h4>
                  <div className="rounded-md bg-muted/50 p-4">
                    <p className="whitespace-pre-wrap text-sm">
                      {product.description || 'No description provided for this product.'}
                    </p>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <h4 className="mb-3 font-medium">Metadata</h4>
                  <div className="rounded-md bg-muted/50 p-4">
                    {product.metadata ? (
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(product.metadata, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional metadata</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>
        
        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <DashboardCard>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Product Images</h3>
              
              {validImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No images available for this product</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Add Images
                  </Button>
                </div>
              ) :
                <>
                  {/* Debug information - collapsible for better UX */}
                  <Collapsible className="mb-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Info className="h-4 w-4 mr-2" />
                        Show Debug Info
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                        <p>Product ID: {product.id}</p>
                        <p>Total images: {product.images?.length || 0}</p>
                        <p>Valid images: {validImages.length}</p>
                        {product.images?.slice(0, 2).map((img, idx) => (
                          <div key={idx} className="mt-1">
                            <p>Image {idx+1}: {img.id}</p>
                            <p>- url: {img.url || 'N/A'}</p>
                            <p>- original_url: {img.original_url || 'N/A'}</p>
                            <p>- thumbnail_url: {img.thumbnail_url || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                
                  {/* Image Gallery - Direct copy from Overview tab */}
                  <div className="flex flex-wrap gap-4 justify-start">
                    {validImages.map((image, index) => (
                      <div 
                        key={image.id || index}
                        className="relative w-32 h-32 overflow-hidden rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 dark:bg-gray-800"
                        onClick={() => openImageModal(index)}
                      >
                        <ImageWithFallback
                          src={image?.original_url ?? image?.thumbnail_url ?? image?.url ?? undefined}
                          alt={`Product image ${index + 1}`}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-1"
                          fallbackSrc="/images/product-placeholder.svg"
                        />
                        
                        {/* Small image number indicator */}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              }
            </div>
          </DashboardCard>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <DashboardCard>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Inventory & Variants</h3>
              
              {(!product.variants || product.variants.length === 0) ? (
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Standard Product</h4>
                      <p className="text-sm text-muted-foreground">This product doesn't have any variants</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(product.status)}>
                      {statusDisplay}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="bg-muted/50 p-3">
                      <h4 className="font-medium">Product Variants ({product.variants.length})</h4>
                    </div>
                    <div className="divide-y">
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between p-4">
                          <div>
                            <h5 className="font-medium">{variant.name}</h5>
                            <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(product.price + variant.price_adjustment)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Stock: {variant.current_stock}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Variants
                  </Button>
                </div>
              )}
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {isImageModalOpen && validImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Navigation buttons */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Image container */}
            <div className="h-[80vh] bg-gray-100 dark:bg-gray-800 relative">
              <ImageWithFallback
                src={validImages[currentImageIndex]?.original_url ?? 
                     validImages[currentImageIndex]?.thumbnail_url ?? 
                     validImages[currentImageIndex]?.url ?? 
                     undefined}
                alt={`Product image ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: 'contain' }}
                className="p-4"
                fallbackSrc="/images/product-placeholder.svg"
              />
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {validImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 