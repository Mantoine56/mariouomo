import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the ErrorDisplay component
 */
interface ErrorDisplayProps {
  /**
   * Error title
   */
  title?: string;
  
  /**
   * Error message to display
   */
  message: string;
  
  /**
   * Optional callback for retry action
   */
  onRetry?: () => void;
  
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  
  /**
   * Variant of the error display
   */
  variant?: "default" | "destructive";
}

/**
 * Error display component for showing error states
 * 
 * Provides a consistent way to display errors with an optional retry button
 */
export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  className = "",
  variant = "destructive"
}: ErrorDisplayProps) {
  const variantClasses = {
    default: "bg-secondary/50 text-secondary-foreground border-secondary",
    destructive: "bg-destructive/10 text-destructive border-destructive/20"
  };
  
  return (
    <div 
      className={cn(
        "rounded-lg border p-4",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <AlertCircle className={cn(
          "h-5 w-5 mt-0.5",
          variant === "destructive" ? "text-destructive" : "text-secondary-foreground"
        )} />
        
        <div className="flex-1 space-y-2">
          <div className="font-medium">{title}</div>
          <div className="text-sm">{message}</div>
          
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 gap-1"
              onClick={onRetry}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 