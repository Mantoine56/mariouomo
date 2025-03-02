/**
 * ActivityList Component
 * 
 * A component for displaying a chronological list of activities or events
 * Supports various activity types with appropriate styling and icons
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, 
  User, 
  Package, 
  CreditCard, 
  Truck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  type LucideIcon
} from 'lucide-react';

// Define activity types and their respective icons
export type ActivityType = 
  | 'order' 
  | 'customer' 
  | 'product' 
  | 'payment' 
  | 'shipment' 
  | 'alert'
  | 'success'
  | 'info';

const activityIcons: Record<ActivityType, LucideIcon> = {
  order: ShoppingCart,
  customer: User,
  product: Package, 
  payment: CreditCard,
  shipment: Truck,
  alert: AlertCircle,
  success: CheckCircle2,
  info: Clock
};

// Style variants for different activity types
const activityVariants: Record<ActivityType, string> = {
  order: 'bg-blue-100 text-blue-600',
  customer: 'bg-purple-100 text-purple-600',
  product: 'bg-amber-100 text-amber-600',
  payment: 'bg-green-100 text-green-600',
  shipment: 'bg-indigo-100 text-indigo-600',
  alert: 'bg-red-100 text-red-600',
  success: 'bg-green-100 text-green-600',
  info: 'bg-gray-100 text-gray-600'
};

// Define activity item properties
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  time: string; // Could be absolute time or relative (e.g., "2 hours ago")
  user?: {
    name: string;
    avatar?: string;
  };
  link?: {
    href: string;
    label: string;
  };
}

interface ActivityListProps extends React.HTMLAttributes<HTMLDivElement> {
  activities: ActivityItem[];
  emptyState?: React.ReactNode;
  maxItems?: number;
}

/**
 * ActivityList component for displaying recent activities
 * 
 * @param activities - Array of activity items to display
 * @param emptyState - Optional content to display when activities array is empty
 * @param maxItems - Optional maximum number of items to display
 * @param className - Additional CSS classes
 */
export function ActivityList({
  activities,
  emptyState,
  maxItems,
  className,
  ...props
}: ActivityListProps) {
  // Limit the number of activities if maxItems is provided
  const displayedActivities = maxItems 
    ? activities.slice(0, maxItems) 
    : activities;

  return (
    <div className={cn("space-y-1", className)} {...props}>
      {displayedActivities.length > 0 ? (
        <ul className="space-y-4">
          {displayedActivities.map((activity) => {
            // Get the appropriate icon component for this activity type
            const IconComponent = activityIcons[activity.type];
            
            return (
              <li key={activity.id} className="relative pl-8">
                {/* Activity icon with type-specific styling */}
                <span
                  className={cn(
                    "absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full",
                    activityVariants[activity.type]
                  )}
                  aria-hidden="true"
                >
                  <IconComponent className="h-4 w-4" />
                </span>
                
                {/* Activity content */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    {/* Title */}
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    
                    {/* Time */}
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {activity.time}
                    </span>
                  </div>
                  
                  {/* Description (if provided) */}
                  {activity.description && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {activity.description}
                    </p>
                  )}
                  
                  {/* User info (if provided) */}
                  {activity.user && (
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      {activity.user.avatar ? (
                        <img 
                          src={activity.user.avatar} 
                          alt={activity.user.name}
                          className="mr-1.5 h-5 w-5 rounded-full"
                        />
                      ) : (
                        <span className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-3 w-3 text-gray-500" />
                        </span>
                      )}
                      <span>{activity.user.name}</span>
                    </div>
                  )}
                  
                  {/* Link (if provided) */}
                  {activity.link && (
                    <a 
                      href={activity.link.href}
                      className="mt-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      {activity.link.label}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        // Show empty state if provided or a default message
        <div className="py-6 text-center">
          {emptyState || (
            <p className="text-sm text-gray-500">No recent activities</p>
          )}
        </div>
      )}
    </div>
  );
} 