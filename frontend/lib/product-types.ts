/**
 * Product Type Definitions
 * 
 * This file contains interfaces and types related to product management
 * These types are used for forms, API interactions, and data display
 */

// Status options for products
export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock' | 'Draft';

// Categories available for products
export const PRODUCT_CATEGORIES = [
  'Apparel',
  'Footwear',
  'Accessories',
  'Outerwear',
  'Home',
  'Beauty',
];

/**
 * Interface for uploaded image data
 */
export interface UploadedImageData {
  id: string;      // Unique identifier for the image
  url: string;     // Public URL to access the image
  name: string;    // Original filename
  size: number;    // File size in bytes
}

// Form data interface used for creating/editing products
export interface ProductFormData {
  id?: string;               // Optional for new products
  name: string;              // Required product name
  price: number;             // Base price (required)
  category: string;          // Product category (required)
  description: string;       // Product description
  inventory: number;         // Current inventory count
  status: ProductStatus;     // Current stock status
  photo_url?: string;        // Legacy field for single image URL
  images?: UploadedImageData[]; // Array of product images
}

// Validation schema for the product form
export const productFormValidationRules = {
  name: {
    required: "Product name is required",
    maxLength: {
      value: 255,
      message: "Name cannot exceed 255 characters"
    }
  },
  price: {
    required: "Price is required",
    min: {
      value: 0.01,
      message: "Price must be greater than 0"
    }
  },
  category: {
    required: "Category is required"
  },
  description: {
    required: "Description is required"
  },
  inventory: {
    required: "Inventory count is required",
    min: {
      value: 0,
      message: "Inventory cannot be negative"
    }
  },
  status: {
    required: "Status is required"
  }
}; 