/**
 * Sidebar Components and Context
 * 
 * A collection of components and hooks for building a collapsible sidebar.
 * Built using Radix UI primitives and React Context for state management.
 */
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PanelLeftClose } from "lucide-react"

// Types
interface SidebarState {
  collapsed: boolean;
}

interface SidebarContextType {
  state: SidebarState;
  toggleCollapsed: () => void;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: 'offcanvas' | 'icon' | 'none';
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
}

// Context
const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

// Provider
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  onStateChange?: (collapsed: boolean) => void;
}

export function SidebarProvider({ 
  children, 
  defaultCollapsed = false,
  onStateChange 
}: SidebarProviderProps) {
  const [state, setState] = React.useState<SidebarState>({
    collapsed: defaultCollapsed
  });

  const toggleCollapsed = React.useCallback(() => {
    setState(prev => {
      const newState = { ...prev, collapsed: !prev.collapsed };
      onStateChange?.(newState.collapsed);
      return newState;
    });
  }, [onStateChange]);

  return (
    <SidebarContext.Provider value={{ state, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook
export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Components
function SidebarRoot({
  children,
  className,
  collapsible = 'none',
  side = 'left',
  variant = 'sidebar',
  ...props
}: SidebarProps) {
  const { state } = useSidebar();
  
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-200",
        state.collapsed ? "w-16" : "w-64",
        className
      )}
      data-state={state.collapsed ? 'collapsed' : 'expanded'}
      data-collapsible={collapsible}
      data-side={side}
      data-variant={variant}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-16 border-b flex items-center", className)}
      {...props}
    />
  );
}

function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-auto py-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t px-4 py-2", className)}
      {...props}
    />
  );
}

function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2", className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  className,
  children,
  isActive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleCollapsed } = useSidebar();

  return (
    <button
      ref={ref}
      className={cn(
        "ml-auto p-2 hover:bg-accent rounded-md transition-colors",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        toggleCollapsed();
      }}
      {...props}
    >
      <PanelLeftClose className="h-4 w-4" />
    </button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { toggleCollapsed } = useSidebar();

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-y-0 right-0 w-1 cursor-ew-resize transition-colors hover:bg-accent",
        className
      )}
      onClick={toggleCollapsed}
      {...props}
    />
  );
});
SidebarRail.displayName = 'SidebarRail';

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 transition-all duration-200",
        state.collapsed ? "ml-16" : "ml-64",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

export {
  SidebarRoot as Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset
}; 