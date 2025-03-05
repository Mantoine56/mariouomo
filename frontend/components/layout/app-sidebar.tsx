/**
 * App Sidebar Component
 * 
 * Main sidebar navigation for the Mario Uomo admin dashboard.
 * Features:
 * - Collapsible sidebar with icon-only mode
 * - Expandable navigation sections
 * - User profile dropdown
 * - Responsive design
 * - Keyboard navigation support
 * - Screen reader accessibility
 * 
 * Usage:
 * ```tsx
 * import AppSidebar from '@/components/layout/app-sidebar';
 * 
 * export default function DashboardLayout() {
 *   return (
 *     <div>
 *       <AppSidebar />
 *       <main>{children}</main>
 *     </div>
 *   );
 * }
 * ```
 */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  ChevronsUpDown,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase, signOut, getCurrentUser } from '@/lib/supabase';

// Navigation items with TypeScript interface for better type safety
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: Array<{
    title: string;
    url: string;
  }>;
}

// Main navigation items configuration
const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: Package,
    items: [
      { title: 'All Products', url: '/dashboard/products' },
      { title: 'Add New', url: '/dashboard/products/new' },
      { title: 'Categories', url: '/dashboard/products/categories' },
    ]
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: ShoppingCart,
    items: [
      { title: 'All Orders', url: '/dashboard/orders' },
      { title: 'Pending', url: '/dashboard/orders/pending' },
      { title: 'Completed', url: '/dashboard/orders/completed' },
    ]
  },
  {
    title: 'Customers',
    url: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
    items: [
      { title: 'General', url: '/dashboard/settings' },
      { title: 'Payment Methods', url: '/dashboard/settings/payments' },
      { title: 'Shipping', url: '/dashboard/settings/shipping' },
      { title: 'Users', url: '/dashboard/settings/users' },
    ]
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    // Get current user on component mount
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-16 items-center px-4">
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <span className="font-bold">MU</span>
          </div>
          <div className='grid flex-1 ml-2 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>Mario Uomo</span>
            <span className='truncate text-xs'>Admin Dashboard</span>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return item?.items && item?.items?.length > 0 ? (
              <Collapsible
                key={item.title}
                defaultOpen={pathname.startsWith(item.url)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.url)}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {!state.collapsed && <span>{item.title}</span>}
                      {!state.collapsed && (
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </CollapsibleTrigger>
                
                {!state.collapsed && (
                  <CollapsibleContent>
                    <div className="ml-6 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.url}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            pathname === subItem.url
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {!state.collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="relative h-8 w-8 rounded-full bg-muted mr-2">
                    <User className="h-5 w-5 absolute inset-0 m-auto" />
                  </div>
                  {!state.collapsed && (
                    <>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                          {user?.email ? user.email.split('@')[0] : 'User'}
                        </span>
                        <span className='truncate text-xs'>
                          {user?.email || 'user@example.com'}
                        </span>
                      </div>
                      <ChevronsUpDown className='ml-auto size-4' />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <div className="relative h-8 w-8 rounded-full bg-muted">
                      <User className="h-5 w-5 absolute inset-0 m-auto" />
                    </div>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {user?.email ? user.email.split('@')[0] : 'User'}
                      </span>
                      <span className='truncate text-xs'>
                        {user?.email || 'user@example.com'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoading} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing out...' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 