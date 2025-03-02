/**
 * Dashboard Layout
 * 
 * Provides the overall layout structure for all dashboard pages
 * Includes responsive sidebar navigation, header with theme toggle and command palette
 */
'use client';

import React, { useState } from 'react';
import { useCookies } from 'next-client-cookies';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get initial sidebar state from cookie
  const cookies = useCookies();
  const initialSidebarState = cookies.get('sidebar:state') === 'false';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  return (
    <SidebarProvider 
      defaultOpen={!initialSidebarState}
    >
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-20 border-r">
          <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-background">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
              <div className="flex items-center justify-center md:justify-start w-full">
                <span className="text-xl font-semibold">Mario Uomo</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <SidebarNav />
            </div>
          </div>
        </aside>
        
        {/* Mobile navigation menu */}
        <MobileNav 
          isOpen={isMobileNavOpen} 
          onClose={() => setIsMobileNavOpen(false)} 
        />
        
        {/* Main content area */}
        <div className="flex flex-col w-full md:pl-64 transition-all duration-300 ease-in-out">
          {/* Header with theme toggle and command menu */}
          <Header />
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 