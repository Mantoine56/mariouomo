/**
 * MobileNav Component
 * 
 * Provides navigation for mobile devices
 * Shows a slide-out menu with navigation items
 */
import React from 'react';
import { X } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-40 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Slide-out panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <Button
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            variant="ghost"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" aria-hidden="true" />
          </Button>
        </div>
        
        {/* Logo/branding */}
        <div className="flex-shrink-0 flex items-center px-4 h-16 border-b border-gray-200">
          <span className="text-xl font-semibold">Mario Uomo Admin</span>
        </div>
        
        {/* Nav items */}
        <div className="mt-5 flex-1 h-0 overflow-y-auto">
          <SidebarNav collapsed={false} />
        </div>
        
        {/* User profile section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <span className="text-sm font-medium">JD</span>
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">John Doe</p>
              <p className="text-sm font-medium text-gray-500">john.doe@mariouomo.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );
} 