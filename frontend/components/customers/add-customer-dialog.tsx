'use client';

/**
 * Add Customer Dialog Component
 * 
 * Dialog/modal component for creating new customers
 * Uses the CustomerForm component for input fields
 */

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerForm } from './customer-form';
import { useToast } from '@/components/ui/use-toast';

/**
 * Add Customer Dialog Component 
 * 
 * Displays a button that opens a modal with the customer form
 */
export function AddCustomerDialog() {
  // State for dialog open/close
  const [open, setOpen] = useState(false);
  // State for loading status during form submission
  const [isLoading, setIsLoading] = useState(false);
  // Toast hook for notifications
  const { toast } = useToast();

  /**
   * Handles form submission - creates a new customer
   * @param data - The customer data from the form
   */
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // In a real application, we would send this data to an API
      // For now we'll simulate an API call with a timeout
      console.log('Creating new customer:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Customer Created",
        description: `Successfully created customer: ${data.name}`,
      });
      
      // Close the dialog
      setOpen(false);
    } catch (error) {
      // Show error message
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record. Fill in all required information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <CustomerForm 
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 