/**
 * @deprecated This component is deprecated in favor of app-sidebar.tsx
 * 
 * This was an earlier implementation of the sidebar navigation.
 * Please use AppSidebar from '@/components/layout/app-sidebar' instead.
 * 
 * Reasons for deprecation:
 * 1. AppSidebar provides a more complete implementation with header and footer
 * 2. AppSidebar has better integration with shadcn/ui components
 * 3. AppSidebar includes user profile and authentication features
 * 4. AppSidebar has better accessibility and keyboard navigation
 * 
 * To migrate:
 * ```tsx
 * // Old usage
 * import { SidebarNav } from './sidebar-nav';
 * 
 * // New usage
 * import AppSidebar from './app-sidebar';
 * ```
 */

/**
 * SidebarNav Component
 * 
 * Navigation component for the dashboard sidebar that provides:
 * - Collapsible navigation sections
 * - Responsive design with icon-only mode
 * - Keyboard navigation support
 * - Screen reader accessibility
 * - Tooltips for icon-only mode
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LayoutDashboard,
  Tag,
  FileBarChart,
  Truck,
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Navigation item interface
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavItem[];
}

// Main navigation items
const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Products',
    href: '/dashboard/products',
    icon: <Package className="h-5 w-5" />,
    submenu: [
      {
        title: 'All Products',
        href: '/dashboard/products',
        icon: <Package className="h-4 w-4" />,
      },
      {
        title: 'Categories',
        href: '/dashboard/products/categories',
        icon: <Tag className="h-4 w-4" />,
      },
      {
        title: 'Inventory',
        href: '/dashboard/products/inventory',
        icon: <Package className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    submenu: [
      {
        title: 'All Orders',
        href: '/dashboard/orders',
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        title: 'Shipments',
        href: '/dashboard/orders/shipments',
        icon: <Truck className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    submenu: [
      {
        title: 'Sales',
        href: '/dashboard/analytics/sales',
        icon: <FileBarChart className="h-4 w-4" />,
      },
      {
        title: 'Traffic',
        href: '/dashboard/analytics/traffic',
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  
  // Check if a nav item or its children are active
  const isNavItemActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(subItem => pathname === subItem.href);
    }
    return false;
  };

  // Render a nav item with tooltip when collapsed
  const NavItemContent = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const content = (
      <>
        <span className={cn('flex-shrink-0 mr-3', collapsed && 'mr-0')}>{item.icon}</span>
        {!collapsed && <span>{item.title}</span>}
      </>
    );

    return collapsed ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center">{content}</span>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      content
    );
  };

  return (
    <nav className="space-y-1 px-2" role="navigation" aria-label="Main">
      {navItems.map((item) => {
        const isActive = isNavItemActive(item);

        return (
          <div key={item.href}>
            {item.submenu ? (
              <Collapsible defaultOpen={isActive}>
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <div className="flex items-center">
                    <NavItemContent item={item} isActive={isActive} />
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200 ui-open:rotate-180"
                      aria-hidden="true"
                    />
                  )}
                </CollapsibleTrigger>
                
                {!collapsed && (
                  <CollapsibleContent className="mt-1">
                    <div className="ml-6 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            pathname === subItem.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <span className="flex-shrink-0 mr-3">{subItem.icon}</span>
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center px-2'
                )}
              >
                <NavItemContent item={item} isActive={isActive} />
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
} 