/**
 * Image Upload Component
 * 
 * A reusable component for uploading and previewing images
 * with drag and drop support and multiple image handling
 */
"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { uploadFile, getStorageUrl, deleteFile } from "@/lib/supabase";
import { productApi } from "@/lib/product-api";
import { ProductImage } from "@/lib/product-api";
import ImageWithFallback from "@/components/ui/image-with-fallback";

/**
 * Type definition for an uploaded image
 */
export interface UploadedImage {
  /** Unique identifier for the image */
  id: string;
  /** Public URL to access the image */
  url: string;
  /** File name of the uploaded image */
  name: string;
  /** Size of the file in bytes */
  size: number;
}

/**
 * Props for the ImageUpload component
 */
interface ImageUploadProps {
  /** The currently uploaded images */
  value: UploadedImage[];
  /** Whether the component is in a disabled state */
  disabled?: boolean;
  /** Callback when the images change */
  onChange: (value: UploadedImage[]) => void;
  /** The maximum number of images that can be uploaded */
  maxImages?: number;
  /** The storage bucket to use for uploads */
  bucket?: string;
  /** The product ID for associating images with a product */
  productId?: string;
}

/**
 * Process Supabase URL to ensure it has the correct format
 * This helps with Supabase storage URLs that might need special handling
 */
export const processSupabaseUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a data URL or relative URL, return as is
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  
  // Check if it's a Supabase URL and ensure it has the correct format
  if (url.includes('supabase.co/storage') && !url.includes('/object/public/')) {
    const parts = url.split('/storage/v1');
    if (parts.length === 2) {
      const newUrl = `${parts[0]}/storage/v1/object/public${parts[1]}`;
      console.log(`[ImageUpload] Reformatted Supabase URL: ${newUrl}`);
      return newUrl;
    }
  }
  
  // Return the original URL if no special processing is needed
  return url;
};

/**
 * Convert API ProductImage to UploadedImage format with validation
 */
export const formatImagesFromApi = (images?: ProductImage[]): UploadedImage[] => {
  if (!images || images.length === 0) return [];
  
  return images
    .filter(img => (img.original_url || img.thumbnail_url || img.url)) // Filter out images without any URLs
    .map(img => {
      // Get the best available URL, prioritizing original_url
      const imageUrl = img.original_url || img.thumbnail_url || img.url || '';
      
      // Process the URL to ensure it has the correct format
      const processedUrl = processSupabaseUrl(imageUrl);
      
      return {
        id: img.id,
        url: processedUrl,
        name: 'Product Image',
        size: 0
      };
    });
};

/**
 * ImageUpload component for handling image uploads with preview
 */
export function ImageUpload({
  value = [],
  disabled = false,
  onChange,
  maxImages = 5,
  bucket = "product-images",
  productId
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  
  // Debug log the images we're receiving
  useEffect(() => {
    if (value.length > 0) {
      console.log(`[ImageUpload] Received ${value.length} images:`, value);
    }
  }, [value]);
  
  // Validate image URLs in the value prop to ensure no missing src attributes
  useEffect(() => {
    const validImages = value.filter(img => !!img.url);
    if (validImages.length !== value.length) {
      console.log('[ImageUpload] Filtering out images with invalid URLs');
      onChange(validImages);
    }
  }, [value, onChange]);

  /**
   * Save the image to the database
   */
  const saveImageToDatabase = async (url: string, productId?: string) => {
    if (!productId) return;
    
    try {
      // Call the API to associate the image with the product
      await productApi.addProductImage(productId, {
        originalUrl: url,
        thumbnailUrl: url
      });
      console.log(`[ImageUpload] Image associated with product ${productId} in database`);
    } catch (error) {
      console.error("[ImageUpload] Error saving image to database:", error);
      // We don't throw here because the upload was successful, just not the database association
    }
  };

  /**
   * Handle file drop from drag and drop
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check if we would exceed the maximum number of images
      if (value.length + acceptedFiles.length > maxImages) {
        toast.error(`You can only upload a maximum of ${maxImages} images.`);
        return;
      }

      setIsUploading(true);
      setUploadStatus("Preparing to upload files...");

      try {
        const newImages: UploadedImage[] = [];

        for (const file of acceptedFiles) {
          // Create a unique file path using timestamp and original filename
          const timestamp = new Date().getTime();
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
          const path = `${timestamp}_${cleanFileName}`;

          setUploadStatus(`Uploading ${file.name}...`);
          console.log(`Uploading file to ${bucket}/${path}`);

          // Upload to Supabase
          const { data, error } = await uploadFile(bucket, path, file);

          if (error) {
            console.error("Error uploading file:", error);
            toast.error(`Error uploading ${file.name}: ${error.message}`);
            continue;
          }

          if (!data) {
            console.error("No data returned from upload");
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }

          // Get the public URL
          const url = getStorageUrl(bucket, path);
          console.log(`File uploaded successfully. Public URL: ${url}`);

          // Add to our list of images
          newImages.push({
            id: path,
            url,
            name: file.name,
            size: file.size
          });

          // If a productId is provided, save the image to the database
          if (productId) {
            setUploadStatus(`Saving ${file.name} to database...`);
            await saveImageToDatabase(url, productId);
          }
        }

        // Update the state with all old and new images
        onChange([...value, ...newImages]);
        
        if (newImages.length > 0) {
          toast.success(`Successfully uploaded ${newImages.length} image(s)`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadStatus(null);
      }
    },
    [value, onChange, maxImages, bucket, productId]
  );

  /**
   * Handle image removal
   */
  const handleRemove = async (image: UploadedImage) => {
    // Remove from Supabase Storage
    try {
      await deleteFile(bucket, image.id);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Continue anyway to remove from UI
    }

    // Filter out the removed image
    onChange(value.filter((img) => img.id !== image.id));
    toast.success("Image removed");
  };

  // Initialize dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isUploading || disabled || value.length >= maxImages,
    maxFiles: maxImages - value.length,
  });

  return (
    <div className="space-y-4">
      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((image) => (
            <div 
              key={image.id} 
              className="group relative aspect-square rounded-md overflow-hidden border border-border"
            >
              <ImageWithFallback
                fill
                src={image.url}
                alt={image.name}
                className="object-cover"
                fallbackSrc="/images/product-placeholder.svg"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/40 transition group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove(image)}
                  disabled={disabled}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md p-6 
          flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isUploading ? 'bg-muted' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">{uploadStatus || "Uploading images..."}</p>
          </div>
        ) : value.length >= maxImages ? (
          <div className="flex flex-col items-center">
            <Check className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Maximum number of images uploaded</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-primary mb-2" />
            <p className="text-base font-medium">
              Drag &amp; drop images here, or click to select files
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Support for JPG, PNG, WEBP. ({value.length}/{maxImages})
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 