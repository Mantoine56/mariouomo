/**
 * SidebarNav Component
 * 
 * Navigation component for the dashboard sidebar
 * Renders a list of navigation items with icons and handles active state
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
  Truck
} from 'lucide-react';

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

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => (
        <div key={item.href}>
          <Link
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isNavItemActive(item)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              collapsed && 'justify-center px-2'
            )}
          >
            <span className={cn('flex-shrink-0 mr-3', collapsed && 'mr-0')}>{item.icon}</span>
            {!collapsed && <span>{item.title}</span>}
          </Link>
          
          {/* Render submenu items if they exist and sidebar is not collapsed */}
          {!collapsed && item.submenu && (
            <div className="mt-1 ml-6 space-y-1">
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
          )}
        </div>
      ))}
    </nav>
  );
} 