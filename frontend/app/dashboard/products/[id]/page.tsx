/**
 * Product Detail Page
 * 
 * This page displays detailed information about a product and allows editing
 */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProductForm } from "../components/product-form";
import { fakeProducts, Product } from "@/lib/mock-api";
import { ProductFormData } from "@/lib/product-types";

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

  // Get product ID from URL params
  const productId = params.id as string;

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await fakeProducts.getProduct(productId);
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
      await fakeProducts.updateProduct(productId, data);
      toast.success('Product updated successfully');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
      throw err; // Re-throw to let the form handle the error state
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

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>
      <DashboardCard>
        <ProductForm initialData={product} onSubmit={handleSubmit} />
      </DashboardCard>
    </div>
  );
} 