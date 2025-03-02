/**
 * StatCard Component
 * 
 * A specialized card component for displaying metrics and statistics in the dashboard
 * Features support for icons, values, changes with trend indicators, and customizable styling
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority";

// Define variant styles for the StatCard
const statCardVariants = cva(
  "rounded-lg shadow-sm overflow-hidden border border-gray-200 bg-card text-card-foreground", 
  {
    variants: {
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8"
      },
      variant: {
        default: "",
        primary: "border-primary/20 bg-primary/5",
        secondary: "border-secondary/20 bg-secondary/5",
        success: "border-green-500/20 bg-green-500/5",
        warning: "border-amber-500/20 bg-amber-500/5",
        danger: "border-red-500/20 bg-red-500/5",
        info: "border-blue-500/20 bg-blue-500/5"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
);

// Define types for change direction
type ChangeDirection = 'increase' | 'decrease' | 'neutral';

// Define component props with VariantProps for styling variants
export interface StatCardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string | number;
  changeDirection?: ChangeDirection;
  description?: string;
  footer?: React.ReactNode;
  loading?: boolean;
}

/**
 * StatCard component for displaying metrics with trend indicators
 * 
 * @param title - The name of the metric (e.g., "Total Revenue", "Orders")
 * @param value - The current value of the metric (e.g., "$1,234.56", "42")
 * @param icon - Optional icon to display with the metric
 * @param change - Optional value indicating change (e.g., "+10%", "-5")
 * @param changeDirection - Direction of change: 'increase', 'decrease', or 'neutral'
 * @param description - Optional description text to display below the value
 * @param footer - Optional footer content
 * @param loading - Whether the stat card is in a loading state
 * @param className - Additional CSS classes
 * @param size - Size variant: 'default', 'sm', or 'lg'
 * @param variant - Color variant: 'default', 'primary', 'secondary', etc.
 */
export function StatCard({
  title,
  value,
  icon,
  change,
  changeDirection = 'neutral',
  description,
  footer,
  loading = false,
  className,
  size,
  variant,
  ...props
}: StatCardProps) {
  // Determine the color class for the change indicator
  const changeColorClass = 
    changeDirection === 'increase' ? 'text-green-600' : 
    changeDirection === 'decrease' ? 'text-red-600' : 
    'text-gray-500';

  return (
    <div
      className={cn(statCardVariants({ size, variant }), className)}
      {...props}
    >
      {/* Card Content */}
      <div className="flex items-start gap-4">
        {/* Icon (if provided) */}
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        
        {/* Main content */}
        <div className={cn("flex-1", icon ? "ml-2" : "")}>
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          
          {/* Value and change indicator */}
          <div className="flex items-baseline">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-semibold">
                {value}
              </div>
            )}
            
            {/* Change indicator (if provided) */}
            {change && !loading && (
              <div className={cn("ml-2 flex items-center text-sm font-medium", changeColorClass)}>
                {changeDirection === 'increase' && <ArrowUpIcon className="h-4 w-4 mr-0.5" />}
                {changeDirection === 'decrease' && <ArrowDownIcon className="h-4 w-4 mr-0.5" />}
                {change}
              </div>
            )}
          </div>
          
          {/* Description (if provided) */}
          {description && !loading && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      
      {/* Footer (if provided) */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
} 