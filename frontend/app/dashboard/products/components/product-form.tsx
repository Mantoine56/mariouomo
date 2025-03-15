/**
 * Product Form Component
 * 
 * This component provides a form for creating and editing products
 * It uses React Hook Form for validation and state management
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader2, Package, Plus, Trash2 } from "lucide-react";
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
import { Product, ProductImage, ProductVariant } from "@/lib/product-api";
import { ImageUpload, UploadedImage } from "@/components/ui/image-upload";
import { formatImagesFromApi } from "@/components/ui/image-upload";
import { ProductImageGallery } from "@/components/ui/product-image-gallery";
import { ProductVariantDialog } from "./product-variant-dialog";
import { ProductApi, productApi } from "@/lib/product-api";
import { formatCurrency } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

/**
 * Form schema for product validation
 */
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  cost_price: z.string().optional(),
  // inventory handling via metadata using record type for flexibility
  metadata: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
  // Updated status options to match backend enum values
  status: z.enum(["active", "draft", "archived"]),
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
 * Convert uploaded images to ProductImage format
 * This is just for UI representation - images should be managed separately from product updates
 */
const formatImagesToApi = (images: UploadedImage[]): Partial<ProductImage>[] => {
  return images.map(img => ({
    id: img.id,
    original_url: img.url,
    thumbnail_url: img.url,
  }));
};

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
  onSubmit: (data: any) => Promise<void>;
}

/**
 * Extended ProductVariant interface for local use
 */
interface ExtendedProductVariant extends ProductVariant {
  option_values?: Record<string, any>;
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
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [isEditVariantDialogOpen, setIsEditVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ExtendedProductVariant | null>(null);
  const [productVariants, setProductVariants] = useState<ExtendedProductVariant[]>(
    (initialData?.variants || []) as ExtendedProductVariant[]
  );
  const router = useRouter();
  
  // Initialize the product API
  const api = new ProductApi();

  // Convert API product images to the format expected by the ImageUpload component
  const initialImages = initialData?.images 
    ? formatImagesFromApi(initialData.images)
    : [];
  
  // Create a function to transform product status values
  const normalizeStatus = (status: string): "active" | "draft" | "archived" => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active" || statusLower === "draft" || statusLower === "archived") {
      return statusLower as "active" | "draft" | "archived";
    }
    return "draft";
  };

  // Update the default values
  const defaultValues = initialData ? {
    name: initialData.name,
    description: initialData.description || "",
    price: initialData.price.toString(),
    cost_price: initialData.cost_price ? initialData.cost_price.toString() : "",
    status: normalizeStatus(initialData.status),
    metadata: initialData.metadata || {},
    images: formatImagesFromApi(initialData.images),
  } : {
    name: "",
    price: "",
    cost_price: "",
    metadata: { category: "General" },
    description: "",
    status: "draft" as const,
    images: []
  };

  // Replace the existing form initialization with:
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  });

  // Calculate profit and profit margin when price or cost changes
  const price = parseFloat(form.watch("price") || "0");
  const cost = parseFloat(form.watch("cost_price") || "0");
  const profit = isNaN(price) || isNaN(cost) ? 0 : price - cost;
  const profitMargin = price <= 0 ? 0 : (profit / price) * 100;

  // Load variants when initial data changes
  useEffect(() => {
    if (initialData?.id) {
      loadProductVariants();
    }
  }, [initialData?.id]);

  // Load product variants
  const loadProductVariants = async () => {
    if (!initialData?.id) return;
    
    try {
      const variants = await api.getProductVariants(initialData.id);
      setProductVariants(variants as ExtendedProductVariant[]);
    } catch (error) {
      console.error("Error loading product variants:", error);
      toast.error("Failed to load product variants");
    }
  };

  // Handle edit variant
  const handleEditVariant = (variant: ExtendedProductVariant) => {
    setSelectedVariant(variant);
    setIsEditVariantDialogOpen(true);
  };

  // Handle delete variant
  const handleDeleteVariant = async (variantId: string) => {
    if (!initialData?.id || !confirm("Are you sure you want to delete this variant?")) return;
    
    try {
      await api.deleteVariant(variantId);
      toast.success("Variant deleted");
      loadProductVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    }
  };

  // Handle save variant
  const handleSaveVariant = async (productId: string, variantData: any): Promise<ProductVariant | boolean | void> => {
    try {
      console.log("Saving variant with data:", variantData, "for product:", productId);
      
      if (selectedVariant) {
        // Update existing variant
        console.log("Updating existing variant:", selectedVariant.id);
        const updatedVariant = await api.updateVariant(selectedVariant.id, variantData);
        toast.success("Variant updated successfully");
        
        // Reload variants to reflect changes
        await loadProductVariants();
        return updatedVariant;
      } else {
        // Create new variant
        console.log("Creating new variant for product:", productId);
        const newVariant = await api.createVariant(productId, variantData);
        console.log("Variant created successfully:", newVariant);
        toast.success("Variant created successfully");
        
        // Reload variants to reflect changes
        await loadProductVariants();
        return newVariant;
      }
    } catch (error: any) {
      console.error("Error saving variant:", error);
      
      // Extract the error message from the API error if possible
      let errorMessage = "Failed to save variant. Please try again.";
      if (error.message) {
        if (typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ');
        }
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format the data for the API - DON'T include images directly in update
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
        // Remove images from the API request - they're handled separately
        images: undefined
      };
      
      await onSubmitProp(formattedData);
      toast.success(initialData ? "Product updated successfully" : "Product created successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the form's default values with correct status value
  useEffect(() => {
    if (initialData) {
      // Convert status to lowercase to match backend enum
      const statusValue = initialData.status.toLowerCase();
      const validStatus = (statusValue === "active" || statusValue === "draft" || statusValue === "archived")
        ? statusValue as "active" | "draft" | "archived"
        : "draft";
        
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price.toString(),
        cost_price: initialData.cost_price ? initialData.cost_price.toString() : "",
        status: validStatus,
        metadata: initialData.metadata || {},
        images: formatImagesFromApi(initialData.images),
      });
    }
  }, [form, initialData]);

  return (
    <>
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

            {/* Cost */}
            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost per item</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your cost per item for profit calculation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profit calculation display */}
            <div className="col-span-1 md:col-span-2 p-4 bg-muted/50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Profit</h4>
                  <p className="text-lg font-bold">${profit.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Margin</h4>
                  <p className="text-lg font-bold">{profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <FormField
              control={form.control}
              name="metadata.inventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventory</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of items in stock. This uses a simplified inventory tracking approach.
                    For advanced inventory management with multiple locations and stock reservations,
                    consider setting up product variants.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="metadata.category"
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
                      <SelectItem value="Apparel">Apparel</SelectItem>
                      <SelectItem value="Footwear">Footwear</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The product category helps organize your inventory.
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
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
                  
                  {/* Display current images in a gallery if they exist */}
                  {initialData?.images && initialData.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Current Images</h4>
                      <ProductImageGallery 
                        images={initialData.images}
                        productName={initialData.name}
                        mainImageClassName="h-48"
                        thumbnailClassName="w-14 h-14"
                      />
                    </div>
                  )}
                  
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      maxImages={5}
                      bucket="product-images"
                      productId={initialData?.id}
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

            {/* Product Variants Section - Only show for existing products */}
            {initialData && initialData.id && (
              <div className="col-span-full mt-4 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Product Variants</h3>
                    <p className="text-sm text-muted-foreground">
                      Add variants like different sizes, colors, or other attributes
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setIsAddVariantDialogOpen(true)}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Variant
                  </Button>
                </div>
                
                {/* Display existing variants if any */}
                <div className="space-y-4">
                  {productVariants.length === 0 ? (
                    <div className="text-center py-6 bg-muted/30 rounded-md">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">No variants added yet</p>
                      <p className="text-xs text-muted-foreground">
                        Add variants to manage different versions of your product (size, color, etc.)
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productVariants.map((variant) => {
                            // Calculate variant price
                            const variantPrice = price + (variant.price_adjustment || 0);
                            
                            // Get option values for display
                            const optionDisplay = variant.option_values
                              ? Object.entries(variant.option_values)
                                  .filter(([key]) => key !== 'name' && key !== 'stock')
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')
                              : 'Default';
                            
                            return (
                              <TableRow key={variant.id}>
                                <TableCell className="font-medium">
                                  {variant.name || optionDisplay}
                                </TableCell>
                                <TableCell>{variant.sku || '—'}</TableCell>
                                <TableCell>{formatCurrency(variantPrice)}</TableCell>
                                <TableCell>{variant.current_stock || 0}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditVariant(variant)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => handleDeleteVariant(variant.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
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

      {/* Add Variant Dialog */}
      <ProductVariantDialog
        open={isAddVariantDialogOpen}
        onClose={() => setIsAddVariantDialogOpen(false)}
        productId={initialData?.id || ''}
        onSave={handleSaveVariant}
      />

      {/* Edit Variant Dialog */}
      <ProductVariantDialog
        open={isEditVariantDialogOpen}
        onClose={() => {
          setIsEditVariantDialogOpen(false);
          setSelectedVariant(null);
        }}
        productId={initialData?.id || ''}
        initialVariant={selectedVariant || undefined}
        onSave={handleSaveVariant}
      />
    </>
  );
} 