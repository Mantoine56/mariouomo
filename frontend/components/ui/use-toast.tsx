'use client';

import { useState } from 'react';

/**
 * Toast notification types
 */
export type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

/**
 * Simple toast hook for showing notifications
 * This is a simplified version - in a real app, you might use a library like react-hot-toast or sonner
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  /**
   * Show a toast notification
   */
  const toast = ({
    title,
    description,
    variant = 'default'
  }: ToastProps) => {
    // In a real implementation, this would display a toast notification
    // For now, we'll just log to console
    console.log(`Toast (${variant}):`, title, description);
  };

  return { toast };
}; 