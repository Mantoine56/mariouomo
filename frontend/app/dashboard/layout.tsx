/**
 * Dashboard Layout
 * 
 * Provides the overall layout structure for all dashboard pages
 * Includes responsive sidebar navigation, header with theme toggle and command palette
 */
'use client';

import React from 'react';
import { useCookies } from 'next-client-cookies';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Get initial sidebar state from cookie
  const cookies = useCookies();
  const initialCollapsed = cookies.get('sidebar:state') === 'true';
  
  // Save sidebar state to cookie when it changes
  const handleStateChange = React.useCallback((collapsed: boolean) => {
    cookies.set('sidebar:state', String(collapsed));
  }, [cookies]);
  
  return (
    <SidebarProvider defaultCollapsed={initialCollapsed} onStateChange={handleStateChange}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main content area */}
        <div className="flex flex-col flex-1 w-0">
          <Header />
          <main className="flex-1 overflow-auto px-6 py-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 