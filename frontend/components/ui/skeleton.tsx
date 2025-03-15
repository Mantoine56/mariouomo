/**
 * Skeleton Component
 * 
 * A placeholder loading component that mimics the shape of content that will load.
 * Used to improve perceived performance and reduce layout shifts during loading.
 */
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton component for displaying loading states
 * 
 * @example
 * <Skeleton className="h-8 w-full" />
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
} 