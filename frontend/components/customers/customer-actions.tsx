'use client';

/**
 * Customer Actions Component
 * 
 * Dropdown menu for customer-related actions such as
 * view details, edit information, and delete
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ClipboardCopy,
  Mail,
  ShoppingCart
} from 'lucide-react';

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import { useToast } from '@/components/ui/use-toast';

// Props interface
interface CustomerActionsProps {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  onDeleted?: () => void;
}

/**
 * Customer Actions Component
 * 
 * Provides a dropdown menu with actions for a specific customer
 */
export function CustomerActions({ customer, onDeleted }: CustomerActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Navigate to customer details page
   */
  const viewCustomer = () => {
    router.push(`/dashboard/customers/${customer.id}`);
  };

  /**
   * Navigate to customer edit page
   * Currently redirects to the details page as edit is in-page
   */
  const editCustomer = () => {
    router.push(`/dashboard/customers/${customer.id}?edit=true`);
  };

  /**
   * Navigate to customer orders page
   */
  const viewCustomerOrders = () => {
    router.push(`/dashboard/orders?customerId=${customer.id}`);
  };

  /**
   * Copy customer email to clipboard
   */
  const copyEmail = () => {
    navigator.clipboard.writeText(customer.email);
    toast({
      title: "Email Copied",
      description: "Customer email has been copied to clipboard."
    });
  };

  /**
   * Open delete confirmation dialog
   */
  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  /**
   * Callback after customer is deleted
   */
  const handleDeleted = () => {
    if (onDeleted) {
      onDeleted();
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={viewCustomer} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={editCustomer} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={viewCustomerOrders} className="cursor-pointer">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Orders
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={copyEmail} className="cursor-pointer">
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Copy Email
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => window.location.href = `mailto:${customer.email}`}
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={openDeleteDialog}
            className="text-destructive cursor-pointer focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDeleteDialog && (
        <DeleteCustomerDialog
          customerId={customer.id}
          customerName={customer.name}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
} 