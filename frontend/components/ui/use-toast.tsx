'use client';

import { useState, useEffect } from 'react';

/**
 * Toast notification types
 */
export type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

type ToastWithId = ToastProps & { id: string; visible: boolean };

/**
 * Toast hook for showing notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastWithId[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  /**
   * Remove a toast from the list
   */
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  /**
   * Start the fade out animation for a toast
   */
  const startToastFadeOut = (id: string) => {
    setToasts((prev) => 
      prev.map((toast) => 
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );
    
    // Remove the toast after animation completes
    setTimeout(() => {
      removeToast(id);
    }, 300);
  };

  /**
   * Show a toast notification
   */
  const toast = ({
    title,
    description,
    variant = 'default'
  }: ToastProps) => {
    // Log to console for debugging
    console.log(`Toast (${variant}):`, title, description);
    
    if (!isBrowser) return;
    
    // Create a unique ID for the toast
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add the toast to state
    setToasts((prev) => [...prev, { id, title, description, variant, visible: true }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      startToastFadeOut(id);
    }, 5000);
  };

  /**
   * Component that renders all toasts
   */
  const ToastContainer = () => {
    if (!isBrowser || toasts.length === 0) return null;
    
    return (
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2 max-w-md">
        {toasts.map((toast) => {
          // Determine background color based on variant
          let bgColor = 'bg-white';
          let borderColor = 'border-gray-200';
          
          if (toast.variant === 'destructive') {
            bgColor = 'bg-red-50';
            borderColor = 'border-red-400';
          } else if (toast.variant === 'success') {
            bgColor = 'bg-green-50';
            borderColor = 'border-green-400';
          }
          
          return (
            <div 
              key={toast.id}
              className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 w-full transition-opacity duration-300 ${toast.visible ? 'opacity-100' : 'opacity-0'}`}
              role="alert"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">{toast.title}</h3>
                <button 
                  onClick={() => startToastFadeOut(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {toast.description && (
                <div className="mt-1 text-sm text-gray-600">{toast.description}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return { toast, ToastContainer };
}; 