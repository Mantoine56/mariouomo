/**
 * Product Detail Page
 * 
 * This page displays detailed information about a product and allows editing
 */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Edit, Trash, Share2, Clock, DollarSign, ShoppingCart, Tag, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProductForm } from "../components/product-form";
import { Product, ProductApi } from "@/lib/product-api";
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

  // Get product ID from URL params
  const productId = params.id as string;

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProduct(productId);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Save updated product data
      const updatedProduct = await productApi.updateProduct(productId, data);
      setProduct(updatedProduct);
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
  const mainImage = product.images && product.images.length > 0 
    ? (product.images[0].original_url || product.images[0].thumbnail_url || '/images/product-placeholder.svg')
    : '/images/product-placeholder.svg';
  
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
      <Tabs defaultValue="overview" className="w-full">
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
                <div className="relative h-48 w-48 overflow-hidden rounded-md">
                  <ImageWithFallback 
                    src={mainImage} 
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    fallbackSrc="/images/product-placeholder.svg"
                  />
                </div>
                <span className="mt-4 text-sm text-muted-foreground">
                  {product.images?.length || 0} Image{product.images?.length !== 1 ? 's' : ''}
                </span>
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
              
              {(!product.images || product.images.length === 0) ? (
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
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {product.images.map((image) => (
                    <div 
                      key={image.id} 
                      className="group relative aspect-square overflow-hidden rounded-md border"
                    >
                      <ImageWithFallback 
                        src={image.original_url} 
                        alt={`Product image of ${product.name}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform group-hover:scale-105"
                        fallbackSrc="/images/product-placeholder.svg"
                      />
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
} 