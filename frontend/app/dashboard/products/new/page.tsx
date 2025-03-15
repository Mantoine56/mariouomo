/**
 * Add New Product Page
 * 
 * This page provides an interface for adding a new product to the store
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProductForm } from "../components/product-form";
import { ProductApi } from "@/lib/product-api";

// Use a real store ID from the database (Mario Uomo Main Store)
const STORE_ID = "8899d7a2-773e-4ae5-8b1a-95d95d9a282b";

/**
 * Page for adding a new product to the store
 * Contains a form for entering product details
 */
export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the product API
  const productApi = new ProductApi();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Ensure price values are properly converted to numbers
      const inventoryQuantity = data.metadata?.inventory 
        ? parseInt(data.metadata.inventory, 10) || 0 
        : 0;
        
      // Extract images from the special _images property
      const images = data._images || [];
      delete data._images; // Remove _images from the data before sending to API
      
      console.log("Form data after processing:", data);
      console.log("Image data:", images);
      
      const productData = {
        ...data,
        store_id: STORE_ID, // Use a valid UUIDv4 from the database
        price: parseFloat(data.price) || 0,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
        // Ensure status is a valid enum value
        status: data.status || 'draft',
        metadata: {
          ...data.metadata,
          // Ensure inventory is stored as a number if it exists in metadata
          inventory: inventoryQuantity,
          category: data.metadata?.category || "General",
        }
      };
      
      // Create the product
      console.log("Sending product data to API:", JSON.stringify(productData));
      const createdProduct = await productApi.createProduct(productData);
      
      // Handle image uploading separately if needed
      if (images && images.length > 0 && createdProduct.id) {
        try {
          console.log(`Adding ${images.length} images to product ${createdProduct.id}`);
          // Process each image
          for (const image of images) {
            await productApi.addProductImage(createdProduct.id, {
              originalUrl: image.url,
              thumbnailUrl: image.url
            });
          }
        } catch (imageError) {
          console.error("Error adding product images:", imageError);
          toast.error("Product created, but there was an issue adding images");
        }
      }
      
      // Check if we have an initial inventory quantity to set up
      if (inventoryQuantity > 0 && createdProduct.id) {
        try {
          // First check if the product has a default variant
          const variants = await productApi.getProductVariants(createdProduct.id);
          
          if (variants && variants.length > 0) {
            // Create inventory record for the default variant
            const defaultVariant = variants[0];
            console.log(`Creating inventory record for default variant ${defaultVariant.id} with quantity ${inventoryQuantity}`);
            
            await productApi.createInitialInventory(
              createdProduct.id,
              defaultVariant.id,
              inventoryQuantity
            );
          } else {
            console.log("No default variant found for inventory creation");
          }
        } catch (inventoryError) {
          console.error("Error setting up initial inventory:", inventoryError);
          // Don't fail the product creation if inventory setup fails
          toast.error("Product created, but inventory setup failed. You can add inventory later.");
        }
      }
      
      toast.success('Product created successfully');
      
      // Navigate to the detail page for the newly created product
      router.push(`/dashboard/products/${createdProduct.id}`);
    } catch (err: any) {
      console.error('Error creating product:', err);
      
      // Extract error message for better user feedback
      let errorMessage = 'Failed to create product';
      if (err.message) {
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (Array.isArray(err.message)) {
          errorMessage = err.message.join(', ');
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Creating product...</p>
            </div>
          </div>
        )}
        <ProductForm onSubmit={handleSubmit} />
      </DashboardCard>
    </div>
  );
} 