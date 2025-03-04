/**
 * Image Upload Component
 * 
 * A reusable component for uploading and previewing images
 * with drag and drop support and multiple image handling
 */
"use client";

import React, { useCallback, useState } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { uploadFile, getStorageUrl, deleteFile } from "@/lib/supabase";

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
}

/**
 * ImageUpload component for handling image uploads with preview
 */
export function ImageUpload({
  value = [],
  disabled = false,
  onChange,
  maxImages = 5,
  bucket = "product-images"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

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

      try {
        const newImages: UploadedImage[] = [];

        for (const file of acceptedFiles) {
          // Create a unique file path using timestamp and original filename
          const timestamp = new Date().getTime();
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
          const path = `${timestamp}_${cleanFileName}`;

          // Upload to Supabase
          const { data, error } = await uploadFile(bucket, path, file);

          if (error) {
            console.error("Error uploading file:", error);
            toast.error(`Error uploading ${file.name}`);
            continue;
          }

          // Get the public URL
          const url = getStorageUrl(bucket, path);

          // Add to our list of images
          newImages.push({
            id: path,
            url,
            name: file.name,
            size: file.size
          });
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
      }
    },
    [value, onChange, maxImages, bucket]
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
              <Image
                fill
                src={image.url}
                alt={image.name}
                className="object-cover"
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
            <p className="text-sm text-muted-foreground">Uploading images...</p>
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