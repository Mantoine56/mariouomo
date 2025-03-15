/**
 * Product Variant Dialog Component
 * 
 * Modal dialog for creating and editing product variants
 * Handles variant attributes like SKU, price adjustments, and option values
 */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Plus, Trash2 } from "lucide-react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { ProductVariant } from "@/lib/product-api";
import { useToast } from "@/components/ui/use-toast";
import { ApiClient } from "@/lib/api-client";
import { ProductApi, productApi } from "@/lib/product-api";

// Extended ProductVariant interface to include the fields we need
interface ExtendedProductVariant extends ProductVariant {
  barcode?: string;
  option_values?: Record<string, any>;
}

/**
 * Form schema for variant validation
 */
const variantFormSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price_adjustment: z.coerce.number().default(0),
  initial_stock: z.coerce.number().min(0, "Stock cannot be negative").default(0),
  // Option values are handled separately
});

// Type for form values
type VariantFormValues = z.infer<typeof variantFormSchema>;

// Interface for option value objects
interface OptionValue {
  name: string;
  value: string;
}

interface ProductVariantDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function to call when the dialog should be closed
   */
  onClose: () => void;
  
  /**
   * Product ID for associating the variant
   */
  productId: string;
  
  /**
   * Initial variant data for editing an existing variant
   */
  initialVariant?: ExtendedProductVariant;
  
  /**
   * Function to call when a variant is saved
   * @returns Promise that resolves to the created/updated variant or boolean indicating success
   */
  onSave: (productId: string, variantData: any) => Promise<ProductVariant | boolean | void>;
}

/**
 * ProductVariantDialog component for creating and editing product variants
 */
export function ProductVariantDialog({
  open,
  onClose,
  productId,
  initialVariant,
  onSave,
}: ProductVariantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionValues, setOptionValues] = useState<OptionValue[]>([]);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const { toast } = useToast();

  // Prepare default values
  const defaultValues: VariantFormValues = initialVariant
    ? {
        name: initialVariant.name || "",
        sku: initialVariant.sku || "",
        barcode: initialVariant.barcode || "",
        price_adjustment: initialVariant.price_adjustment || 0,
        initial_stock: 0, // This is just for new inventory, not for editing
      }
    : {
        name: "",
        sku: "",
        barcode: "",
        price_adjustment: 0,
        initial_stock: 0,
      };

  // Initialize the form
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues,
  });

  // Extract option values from initialVariant if available
  useEffect(() => {
    if (initialVariant?.option_values && open) {
      const options: OptionValue[] = [];
      
      // Skip 'name' which is handled separately
      Object.entries(initialVariant.option_values).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'stock') {
          options.push({ name: key, value: String(value) });
        }
      });
      
      setOptionValues(options);
    } else if (open) {
      // Reset for new variant
      setOptionValues([]);
      setNewOptionName("");
      setNewOptionValue("");
    }
  }, [initialVariant, open]);

  // Handle adding a new option value
  const handleAddOption = () => {
    if (!newOptionName.trim() || !newOptionValue.trim()) {
      toast({
        title: "Missing values",
        description: "Both option name and value are required",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure option name is descriptive - don't allow arbitrary values
    const descriptiveOptionNames = ['color', 'size', 'material', 'style', 'type'];
    const normalizedName = newOptionName.toLowerCase();
    
    // If it's not a common descriptive option name, give a suggestion
    if (!descriptiveOptionNames.includes(normalizedName) && 
        !normalizedName.includes('color') && 
        !normalizedName.includes('size') && 
        !normalizedName.includes('style') && 
        !normalizedName.includes('type')) {
      
      const proceed = confirm(
        `Option name "${newOptionName}" doesn't appear to be descriptive. ` +
        `Consider using descriptive names like "color", "size", or "material". ` +
        `Do you want to proceed with "${newOptionName}"?`
      );
      
      if (!proceed) return;
    }
    
    // Check for duplicates
    if (optionValues.some(ov => ov.name.toLowerCase() === normalizedName)) {
      toast({
        title: "Duplicate option",
        description: `Option "${newOptionName}" already exists`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the new option (keep original case for display)
    setOptionValues([...optionValues, { name: newOptionName, value: newOptionValue }]);
    
    // Reset inputs
    setNewOptionName("");
    setNewOptionValue("");
  };

  // Handle removing an option value
  const handleRemoveOption = (indexToRemove: number) => {
    setOptionValues(optionValues.filter((_, index) => index !== indexToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: VariantFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert option values to the format expected by the API
      const option_values: Record<string, any> = {};
      
      optionValues.forEach(ov => {
        // Make sure option names are descriptive (like 'color', 'size')
        // Don't use the values themselves as keys
        option_values[ov.name.toLowerCase()] = ov.value;
      });
      
      // We'll handle initial stock in a separate inventory record
      // NOT using option_values.stock anymore
      const initialStock = !initialVariant ? data.initial_stock : 0;
      
      // Prepare the variant data without stock information
      const variantData = {
        ...data,
        option_values,
        // Remove initial_stock as it's not part of the variant entity
        initial_stock: undefined
      };
      
      console.log('Saving variant with data:', variantData);
      
      // Save the variant - make sure we get a variant object back
      const result = await onSave(productId, variantData);
      
      // If this is a new variant with initial stock, create inventory record
      // Only attempt to create inventory if we have a variant object with ID
      if (!initialVariant && initialStock > 0) {
        // Check if result is a variant object with an ID
        if (result && typeof result === 'object' && 'id' in result) {
          const variant = result as ProductVariant;
          try {
            // Create inventory record using the productApi helper
            await productApi.createInventoryItem(variant.id, {
              quantity: initialStock,
              location: 'Default',
              reorder_point: 5,
              reorder_quantity: 10
            });
            
            console.log(`Created inventory record for variant with ${initialStock} units`);
          } catch (inventoryError) {
            console.error('Error creating inventory record:', inventoryError);
            toast({
              title: "Warning",
              description: "Variant created, but inventory record failed to create. Stock information may not be accurate.",
              variant: "destructive",
            });
          }
        }
      }
      
      // Show success message
      toast({
        title: "Success",
        description: initialVariant ? "Variant updated" : "Variant created" + 
          (initialStock > 0 ? " with initial inventory" : ""),
      });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast({
        title: "Error",
        description: `Failed to ${initialVariant ? "update" : "create"} variant`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialVariant ? "Edit Variant" : "Add New Variant"}
          </DialogTitle>
          <DialogDescription>
            {initialVariant
              ? "Update variant details and options"
              : "Add a new variant with specific options and pricing"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Variant Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Red XL, Small Blue" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this variant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PROD-RED-XL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for inventory tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Adjustment */}
            <FormField
              control={form.control}
              name="price_adjustment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Adjustment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Amount to add/subtract from base price
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Option values list */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Option Values</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add descriptive options like color, size, etc.
                </p>
              </div>

              {/* Add option form */}
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                    >
                      <option value="" disabled>Select option type</option>
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="material">Material</option>
                      <option value="style">Style</option>
                      <option value="type">Type</option>
                      <option value="custom">Custom...</option>
                    </select>
                    {newOptionName === 'custom' && (
                      <Input
                        placeholder="Custom option name"
                        value=""
                        onChange={(e) => setNewOptionName(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                <Input
                  placeholder="Option value"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOption}
                  className="px-2"
                  title="Add Option"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Option values list */}
              <div className="border rounded-md p-3 bg-muted/50 min-h-[80px]">
                {optionValues.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No options added yet. Add options like "color: red" or "size: XL"
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {optionValues.map((option, index) => (
                      <Badge key={index} className="px-2 py-1 flex items-center gap-1">
                        <span className="font-medium">{option.name}:</span> {option.value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full ml-1"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Initial Stock (only for new variants) */}
            {!initialVariant && (
              <FormField
                control={form.control}
                name="initial_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Initial inventory quantity for this variant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialVariant ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  initialVariant ? "Update Variant" : "Create Variant"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 