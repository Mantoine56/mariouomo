/**
 * Sidebar Component
 * 
 * A responsive, collapsible sidebar for application navigation.
 * Adapted from next-shadcn-dashboard-starter template.
 */
'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { useCookies } from 'next-client-cookies';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Context for sidebar state management
// ============================================================================

type SidebarContextType = {
  state: SidebarState;
  setState: React.Dispatch<React.SetStateAction<SidebarState>>;
  toggle: () => void;
  isMobile: boolean;
};

type SidebarState = 'open' | 'closed' | 'icon';

// Create a context with a default value
const SidebarContext = createContext<SidebarContextType>({
  state: 'open',
  setState: () => {},
  toggle: () => {},
  isMobile: false
});

// ============================================================================
// Provider component for the sidebar
// ============================================================================

export function SidebarProvider({
  children,
  defaultOpen = true
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [state, setState] = useState<SidebarState>(defaultOpen ? 'open' : 'closed');
  const [isMobile, setIsMobile] = useState(false);
  const cookies = useCookies();

  useEffect(() => {
    // Detect mobile screens and close sidebar on small screens
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setState('closed');
      } else {
        const lastState = cookies.get('sidebar:state') === 'true' ? 'open' : 'closed';
        setState(lastState);
      }
    };

    // Initial check
    handleResize(mobileQuery);

    // Add listener for window resize
    const mediaQueryList = window.matchMedia('(max-width: 768px)');
    mediaQueryList.addEventListener('change', handleResize);

    return () => {
      mediaQueryList.removeEventListener('change', handleResize);
    };
  }, [cookies]);

  /**
   * Toggles the sidebar state between open and closed
   */
  const toggle = useCallback(() => {
    setState((prev) => {
      const next = prev === 'open' ? 'closed' : 'open';
      cookies.set('sidebar:state', next === 'open' ? 'true' : 'false');
      return next;
    });
  }, [cookies]);

  return (
    <SidebarContext.Provider value={{ state, setState, toggle, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook to access sidebar state
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// ============================================================================
// Sidebar component
// ============================================================================

const sidebarVariants = cva(
  'relative z-[1000] flex h-full min-h-screen flex-col bg-background text-foreground data-[state=closed]:w-0 data-[state=open]:w-[280px] data-[state=icon]:w-[56px] transition-[width] duration-200',
  {
    variants: {
      variant: {
        default: 'border-r',
        separate: ''
      },
      collapsible: {
        'default': '',
        'icon': ''
      }
    },
    defaultVariants: {
      variant: 'default',
      collapsible: 'default'
    }
  }
);

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'separate';
  collapsible?: 'default' | 'icon';
}

export function Sidebar({
  className,
  variant,
  collapsible,
  ...props
}: SidebarProps) {
  const { state } = useSidebar();

  return (
    <div
      className={cn(sidebarVariants({ variant, collapsible, className }))}
      data-state={state}
      {...props}
    />
  );
}

// ============================================================================
// Sidebar subcomponents
// ============================================================================

// Header component for sidebar (typically contains logo and toggle)
export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b px-4 py-2', className)}
      {...props}
    />
  );
}

// Main content area for sidebar (scrollable)
export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-auto py-2', className)}
      {...props}
    />
  );
}

// Footer for sidebar 
export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-auto border-t px-2 py-2', className)}
      {...props}
    />
  );
}

// Group of related menu items
export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pb-4', className)} {...props} />;
}

// Label for a group of menu items
export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar();
  
  // Hide label when sidebar is in icon-only mode
  if (state === 'icon') {
    return null;
  }
  
  return (
    <div
      className={cn(
        'px-4 py-1 text-sm font-bold text-muted-foreground/70',
        className
      )}
      {...props}
    />
  );
}

// Container for menu items
export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

// Individual menu item container
export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

// Button variants for menu items
const menuButtonVariants = cva(
  'group relative flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm font-medium transition-colors data-[active="true"]:bg-accent data-[active="true"]:font-bold data-[active="true"]:text-accent-foreground focus:outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground dark:hover:bg-muted/50 dark:focus:bg-muted/50',
  {
    variants: {
      size: {
        default: 'min-h-9',
        lg: 'min-h-12'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

// Clickable menu button
interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  tooltip?: string;
  size?: 'default' | 'lg';
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, isActive, tooltip, asChild = false, size, children, ...props },
    ref
  ) => {
    const { state } = useSidebar();
    const Comp = asChild ? React.Fragment : 'button';
    // @ts-ignore
    const childProps = asChild ? { ...props, className: menuButtonVariants({ size, className }), 'data-active': isActive } : props;

    return (
      <Comp
        ref={ref}
        className={
          asChild
            ? undefined
            : cn(menuButtonVariants({ size, className }))
        }
        data-active={isActive}
        {...childProps}
      >
        {state === 'icon' && tooltip ? (
          <span className="sr-only">{tooltip}</span>
        ) : null}
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

// Submenu container for nested menus
export function SidebarMenuSub({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-1 ml-4 space-y-1 border-l pl-2', className)}
      {...props}
    />
  );
}

// Item in a submenu
export function SidebarMenuSubItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

// Clickable button in a submenu
interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  asChild?: boolean;
}

export const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuSubButtonProps
>(({ className, isActive, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'button';
  // @ts-ignore
  const childProps = asChild ? { ...props, className: cn(
    'group relative flex w-full cursor-pointer items-center rounded-md py-1 text-sm font-medium transition-colors data-[active="true"]:font-bold data-[active="true"]:text-accent-foreground focus:outline-none hover:text-accent-foreground focus:text-accent-foreground',
    className
  ), 'data-active': isActive } : props;

  return (
    <Comp
      ref={ref}
      className={
        asChild
          ? undefined
          : cn(
              'group relative flex w-full cursor-pointer items-center rounded-md py-1 text-sm font-medium transition-colors data-[active="true"]:font-bold data-[active="true"]:text-accent-foreground focus:outline-none hover:text-accent-foreground focus:text-accent-foreground',
              className
            )
      }
      data-active={isActive}
      {...childProps}
    >
      {children}
    </Comp>
  );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

// Rail component for collapsed sidebar (shows icons only)
export function SidebarRail(props: React.HTMLAttributes<HTMLDivElement>) {
  const { toggle } = useSidebar();
  return (
    <div
      className="absolute -right-3 top-6 z-[1001] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground shadow-md"
      onClick={() => toggle()}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <polyline points="13 17 18 12 13 7"></polyline>
        <polyline points="6 17 11 12 6 7"></polyline>
      </svg>
    </div>
  );
}

// Inset component for content next to sidebar
export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        'flex min-h-screen flex-1 flex-col overflow-hidden transition-[margin]',
        state === 'open' && 'md:ml-[280px]',
        state === 'icon' && 'md:ml-[56px]',
        className
      )}
      {...props}
    />
  );
} 