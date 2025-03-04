import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading component for displaying loading states
 * 
 * Provides a consistent loading animation with customizable size, message, and height
 */
interface LoadingProps {
  /**
   * Message to display under the loading spinner
   */
  message?: string;
  
  /**
   * Size of the loading spinner
   */
  size?: 'sm' | 'default' | 'lg';
  
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  
  /**
   * Minimum height of the loading container
   */
  minHeight?: string;
}

/**
 * Loading component that displays a spinner and optional message
 */
export function Loading({ 
  message = "Loading...", 
  size = "default",
  className = "",
  minHeight = "200px"
}: LoadingProps) {
  // Size classes for the spinner
  const spinnerSizeClasses = {
    sm: "h-5 w-5",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  // Size classes for the message text
  const textSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base"
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-muted-foreground",
        className
      )}
      style={{ minHeight }}
    >
      <Loader2 
        className={cn(
          "animate-spin mb-2",
          spinnerSizeClasses[size]
        )} 
      />
      {message && (
        <p className={cn(textSizeClasses[size])}>{message}</p>
      )}
    </div>
  );
} 