/**
 * Product Image Gallery Component
 * 
 * A reusable component for displaying product images in a gallery format
 * with support for thumbnails and image modal
 */
"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { ProductImage } from "@/lib/product-api";

/**
 * Props for the ProductImageGallery component
 */
interface ProductImageGalleryProps {
  /** The product images to display */
  images: ProductImage[];
  /** The product name for alt text */
  productName: string;
  /** Whether to show thumbnails */
  showThumbnails?: boolean;
  /** Maximum number of thumbnails to show */
  maxThumbnails?: number;
  /** Whether to enable the lightbox/modal */
  enableLightbox?: boolean;
  /** CSS class for the main image container */
  mainImageClassName?: string;
  /** CSS class for the thumbnail container */
  thumbnailClassName?: string;
}

/**
 * Process image URLs to ensure they have the correct format
 */
const processImageUrl = (image: ProductImage): string => {
  // Try to get any valid URL, prioritizing original_url
  let imageUrl = image.original_url || image.thumbnail_url || image.url || '';
  
  // Process Supabase URLs to ensure they have the correct format
  if (imageUrl && imageUrl.includes('supabase.co/storage') && !imageUrl.includes('/object/public/')) {
    const parts = imageUrl.split('/storage/v1');
    if (parts.length === 2) {
      imageUrl = `${parts[0]}/storage/v1/object/public${parts[1]}`;
      console.log(`[ProductImageGallery] Reformatted Supabase URL: ${imageUrl}`);
    }
  }
  
  return imageUrl || '/images/product-placeholder.svg';
};

/**
 * ProductImageGallery component for displaying product images
 */
export function ProductImageGallery({
  images = [],
  productName = "Product",
  showThumbnails = true,
  maxThumbnails = 5,
  enableLightbox = true,
  mainImageClassName = "h-64",
  thumbnailClassName = "w-16 h-16"
}: ProductImageGalleryProps) {
  // Filter out images without valid URLs
  const validImages = images.filter(img => !!img.original_url || !!img.thumbnail_url || !!img.url);
  
  // State for image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Log the valid images for debugging
  React.useEffect(() => {
    console.log(`[ProductImageGallery] Found ${validImages.length} valid images:`, validImages);
  }, [validImages]);
  
  // Function to open the image modal
  const openImageModal = (index: number) => {
    if (!enableLightbox) return;
    console.log(`[ProductImageGallery] Opening image modal with index: ${index}`);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };
  
  // Function to navigate to next image in modal
  const nextImage = () => {
    if (validImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % validImages.length);
  };
  
  // Function to navigate to previous image in modal
  const prevImage = () => {
    if (validImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + validImages.length) % validImages.length);
  };
  
  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="flex flex-col space-y-4 w-full">
        <div className={`relative w-full overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800 ${mainImageClassName}`}>
          <ImageWithFallback
            src={undefined}
            alt={productName}
            fill
            style={{ objectFit: 'contain' }}
            className="p-2"
            fallbackSrc="/images/product-placeholder.svg"
          />
        </div>
        <span className="text-sm text-muted-foreground text-center">
          No images available
        </span>
      </div>
    );
  }
  
  // Get the main image URL
  const mainImageUrl = processImageUrl(validImages[0]);
  
  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Main product image */}
      <div 
        className={`relative w-full overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800 ${enableLightbox ? 'cursor-pointer' : ''} ${mainImageClassName}`}
        onClick={() => validImages.length > 0 && openImageModal(0)}
      >
        <ImageWithFallback 
          src={mainImageUrl !== '/images/product-placeholder.svg' ? mainImageUrl : undefined}
          alt={productName}
          fill
          style={{ objectFit: 'contain' }}
          className="p-2"
          fallbackSrc="/images/product-placeholder.svg"
        />
      </div>
      
      {/* Thumbnail gallery if there are multiple images */}
      {showThumbnails && validImages.length > 1 ? (
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {validImages
            .slice(0, maxThumbnails) // Show max N thumbnails to prevent overflow
            .map((image, index) => (
              <div 
                key={image.id || index}
                className={`relative overflow-hidden rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 dark:bg-gray-800 ${thumbnailClassName}`}
                onClick={() => openImageModal(index)}
              >
                <ImageWithFallback
                  src={processImageUrl(image)}
                  alt={`Product image ${index + 1}`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-1"
                  fallbackSrc="/images/product-placeholder.svg"
                />
              </div>
            ))
          }
          
          {/* If there are more than maxThumbnails images, show a "+X more" button */}
          {validImages.length > maxThumbnails && (
            <div 
              className={`relative overflow-hidden rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-primary/10 flex items-center justify-center text-xs font-medium ${thumbnailClassName}`}
            >
              +{validImages.length - maxThumbnails} more
            </div>
          )}
        </div>
      ) : null}
      
      {/* Image count */}
      <span className="text-sm text-muted-foreground text-center">
        {validImages.length} Image{validImages.length !== 1 ? 's' : ''}
      </span>
      
      {/* Image Modal/Lightbox */}
      {isImageModalOpen && validImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Navigation buttons */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Image container */}
            <div className="h-[80vh] bg-gray-100 dark:bg-gray-800 relative">
              <ImageWithFallback
                src={processImageUrl(validImages[currentImageIndex])}
                alt={`Product image ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: 'contain' }}
                className="p-4"
                fallbackSrc="/images/product-placeholder.svg"
              />
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {validImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 