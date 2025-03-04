/**
 * Add New Product Page
 * 
 * This page provides an interface for adding a new product to the store
 */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProductForm } from "../components/product-form";
import { fakeProducts } from "@/lib/mock-api";

/**
 * Page for adding a new product to the store
 * Contains a form for entering product details
 */
export default function NewProductPage() {
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      await fakeProducts.createProduct(data);
      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error('Failed to create product');
      throw err; // Re-throw to let the form handle the error state
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>
      <DashboardCard>
        <ProductForm onSubmit={handleSubmit} />
      </DashboardCard>
    </div>
  );
} 