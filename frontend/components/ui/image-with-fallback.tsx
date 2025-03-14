/**
 * ImageWithFallback Component
 * 
 * A wrapper around Next.js Image component that provides fallback support
 * and better error handling for product images.
 */
"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

/**
 * ImageWithFallback props interface
 * Extends Next.js ImageProps with fallback URL
 */
interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  /**
   * URL to use as fallback if primary image fails to load
   */
  fallbackSrc?: string;
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
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Handle image loading error
   * Replaces the source with fallback and logs the error
   */
  const handleError = () => {
    if (!hasError) {
      console.warn(`Image failed to load: ${imgSrc}. Using fallback: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
} 