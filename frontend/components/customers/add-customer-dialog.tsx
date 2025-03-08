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

// API client
import { customerApi } from '@/lib/customer-api';

// Props for the dialog component
interface AddCustomerDialogProps {
  onCustomerAdded?: () => void;
}

/**
 * Add Customer Dialog Component 
 * 
 * Displays a button that opens a modal with the customer form
 */
export function AddCustomerDialog({ onCustomerAdded }: AddCustomerDialogProps) {
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
      // Call the API to create a new customer
      await customerApi.createCustomer({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        status: 'active',
        notes: data.notes,
      });
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Customer created successfully',
        variant: 'default',
      });
      
      // Close the dialog
      setOpen(false);
      
      // Call the onCustomerAdded callback if provided
      if (onCustomerAdded) {
        onCustomerAdded();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record. Fill out the form below with the customer's information.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 