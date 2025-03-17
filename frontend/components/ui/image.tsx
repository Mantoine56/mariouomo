"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

/**
 * Extended props for the Image component
 */
interface ImageProps {
  /**
   * Image source URL
   */
  src: string;
  
  /**
   * Alternative text for the image
   */
  alt: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * CSS class names for when image is loading
   */
  loadingClassName?: string;
  
  /**
   * CSS class names for when image fails to load
   */
  errorClassName?: string;
  
  /**
   * Content to display while image is loading
   */
  loadingContent?: React.ReactNode;
  
  /**
   * Content to display when image fails to load
   */
  errorContent?: React.ReactNode;
  
  /**
   * Whether to show loading state
   */
  showLoading?: boolean;
  
  /**
   * Fill the container
   */
  fill?: boolean;
  
  /**
   * Width of the image
   */
  width?: number;
  
  /**
   * Height of the image
   */
  height?: number;
  
  /**
   * Object fit property
   */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * Enhanced Image component that handles loading and error states
 * 
 * This component extends Next.js Image component with additional
 * features for loading states and error handling.
 */
export function Image({
  alt,
  src,
  className,
  loadingClassName,
  errorClassName,
  loadingContent,
  errorContent,
  showLoading = true,
  fill,
  width,
  height,
  objectFit,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(showLoading);
  const [hasError, setHasError] = useState(false);
  
  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // Handle image loading error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  // Prepare image style for object-fit
  const imageStyle = objectFit ? { objectFit } : undefined;
  
  return (
    <div className={cn("relative", className)}>
      {isLoading && loadingContent && (
        <div className={cn("absolute inset-0 flex items-center justify-center bg-muted", loadingClassName)}>
          {loadingContent}
        </div>
      )}
      
      {hasError ? (
        <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", errorClassName || className)}>
          {errorContent || (
            <span className="text-xs">Failed to load image</span>
          )}
        </div>
      ) : (
        <NextImage
          alt={alt}
          src={src}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          fill={fill}
          width={width}
          height={height}
          style={imageStyle}
          {...props}
        />
      )}
    </div>
  );
} 