/**
 * ImageWithFallback Component
 * 
 * A wrapper around Next.js Image component that provides fallback support
 * and better error handling for product images.
 */
"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

/**
 * ImageWithFallback props interface
 * Extends Next.js ImageProps with fallback URL
 */
interface ImageWithFallbackProps extends Omit<ImageProps, "onError" | "src"> {
  /**
   * URL to use as fallback if primary image fails to load
   */
  fallbackSrc?: string;
  /**
   * Source URL, can be undefined (will use fallback in that case)
   */
  src?: string;
}

/**
 * ImageWithFallback component
 * 
 * Renders an image with built-in fallback support
 * @param props ImageWithFallbackProps
 * @returns JSX.Element
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/images/product-placeholder.svg",
  ...props
}: ImageWithFallbackProps) {
  // Track if the image has errored
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset error state if src changes
  useEffect(() => {
    console.log(`[ImageWithFallback] Source changed: ${src}`);
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  /**
   * Process image URL to ensure it's correctly formatted
   * This helps with Supabase storage URLs that might need special handling
   */
  const processImageUrl = (url: string): string => {
    // If it's already a data URL or relative URL, return as is
    if (!url) {
      console.warn('[ImageWithFallback] Empty image URL provided');
      return fallbackSrc;
    }
    
    if (url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    
    // Check if it's a Supabase URL and ensure it has the correct format
    if (url.includes('supabase.co/storage')) {
      console.log(`[ImageWithFallback] Loading Supabase image: ${url}`);
      return url;
    }
    
    // Return the original URL if no special processing is needed
    return url;
  };

  /**
   * Handle image loading error
   * Replaces the source with fallback and logs the error
   */
  const handleError = () => {
    if (!hasError) {
      console.error(`[ImageWithFallback] Image failed to load: ${imgSrc}`);
      console.log('[ImageWithFallback] Using fallback image:', fallbackSrc);
      
      // Add more detailed error information for debugging
      if (imgSrc && imgSrc.includes('supabase')) {
        console.error('[ImageWithFallback] Supabase storage image failed to load. Check CORS settings and bucket permissions.');
      }
      
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Process the URL before rendering
  const processedSrc = processImageUrl(imgSrc);
  console.log(`[ImageWithFallback] Rendering image with src: ${processedSrc}`);

  return (
    <Image
      {...props}
      src={processedSrc}
      alt={alt}
      onError={handleError}
    />
  );
} 