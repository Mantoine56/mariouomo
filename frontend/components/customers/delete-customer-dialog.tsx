'use client';

/**
 * Delete Customer Dialog Component
 * 
 * Confirmation dialog for deleting customers
 * Includes safety measures to prevent accidental deletion
 */

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import React from 'react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Props interface
interface DeleteCustomerDialogProps {
  customerId: string;
  customerName: string;
  // Optional trigger component to customize the button
  trigger?: React.ReactNode;
  // Optional callback after successful deletion
  onDeleted?: () => void;
}

/**
 * Delete Customer Dialog Component
 * 
 * Displays a confirmation dialog before deleting a customer
 */
export function DeleteCustomerDialog({
  customerId,
  customerName,
  trigger,
  onDeleted,
}: DeleteCustomerDialogProps) {
  // State for dialog open/close
  const [open, setOpen] = useState(false);
  // State for loading status during deletion
  const [isLoading, setIsLoading] = useState(false);
  // Toast hook for notifications
  const { toast } = useToast();

  /**
   * Handles customer deletion
   */
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // In a real application, we would send a request to an API
      // For now we'll simulate an API call with a timeout
      console.log(`Deleting customer: ${customerId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Customer Deleted",
        description: `Successfully deleted customer: ${customerName}`,
      });
      
      // Close dialog
      setOpen(false);
      
      // Call the callback if provided
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      // Show error message
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action will permanently delete the customer <strong>{customerName}</strong> and all associated data. 
            This action cannot be undone and may affect related orders and communications.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 