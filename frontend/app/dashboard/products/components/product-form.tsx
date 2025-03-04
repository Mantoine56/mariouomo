/**
 * Product Form Component
 * 
 * This component provides a form for creating and editing products
 * It uses React Hook Form for validation and state management
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Product } from "@/lib/mock-api";
import { ImageUpload, UploadedImage } from "@/components/ui/image-upload";

/**
 * Form schema for product validation
 */
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  inventory: z.coerce.number().min(0, "Inventory must be 0 or greater"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  status: z.enum(["Active", "Draft", "Out of Stock", "Low Stock"]),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    name: z.string(),
    size: z.number()
  })).default([])
});

// Type for form values
type ProductFormValues = z.infer<typeof productFormSchema>;

/**
 * Props for the ProductForm component
 */
interface ProductFormProps {
  /**
   * Initial product data for editing an existing product
   */
  initialData?: Product;
  
  /**
   * Callback function called when form is submitted successfully
   * @param data The form data
   */
  onSubmit: (data: ProductFormValues) => Promise<void>;
}

/**
 * ProductForm component for creating and editing products
 * Uses React Hook Form with Zod validation
 */
export function ProductForm({ 
  initialData,
  onSubmit: onSubmitProp
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Convert initialData images if they exist
  const initialImages: UploadedImage[] = initialData?.images 
    ? initialData.images 
    : initialData?.photo_url 
      ? [{ 
          id: 'legacy-image', 
          url: initialData.photo_url, 
          name: 'Product Image', 
          size: 0 
        }] 
      : [];
  
  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: String(initialData.price), // Convert number to string for the form
      images: initialImages
    } : {
      name: "",
      price: "",
      inventory: 0,
      category: "",
      description: "",
      status: "Draft",
      images: []
    }
  });

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      await onSubmitProp(data);
      toast.success(initialData ? "Product updated successfully" : "Product created successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your product as it will appear to customers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  The price in USD (e.g., 19.99).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inventory */}
          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Number of items in stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Shirts">Shirts</SelectItem>
                    <SelectItem value="Pants">Pants</SelectItem>
                    <SelectItem value="Shoes">Shoes</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Outerwear">Outerwear</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The category this product belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The current status of this product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload - Replacing Photo URL */}
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Product Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    maxImages={5}
                    bucket="product-images"
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 5 product images. The first image will be used as the main product image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter product description" 
                    className="min-h-32" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A detailed description of the product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Product" : "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 