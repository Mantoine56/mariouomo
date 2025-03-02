/**
 * DashboardCard Component
 * 
 * A versatile card component for displaying content in the dashboard
 * Provides consistent styling with optional header, footer, and padding controls
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
  children: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  footer,
  headerAction,
  noPadding = false,
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Card header */}
      {(title || description || headerAction) && (
        <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            {/* Title and description */}
            <div>
              {title && (
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
            
            {/* Optional action in header */}
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      
      {/* Card content */}
      <div
        className={cn(
          "flex-1",
          !noPadding && "p-6"
        )}
      >
        {children}
      </div>
      
      {/* Optional card footer */}
      {footer && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
} 