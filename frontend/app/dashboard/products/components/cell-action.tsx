'use client';
import { Button } from '@/components/ui/button';
import { fakeProducts, Product } from '@/lib/mock-api';
import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import the necessary UI components
// We'll recreate them in a simplified version as we don't have the full shadcn components

/**
 * DropdownMenu components for action menu
 */
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const DropdownMenuContent = ({ 
  children, 
  align = 'right'
}: { 
  children: React.ReactNode;
  align?: 'left' | 'right';
}) => (
  <div className={`absolute mt-2 ${align === 'right' ? 'right-0' : 'left-0'} z-10 min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-md`}>
    {children}
  </div>
);

const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>
);

const DropdownMenuItem = ({ 
  children, 
  onClick,
  className = ''
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

/**
 * AlertDialog components for delete confirmation
 */
const AlertDialog = ({ 
  open, 
  onOpenChange,
  children 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => (
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-md rounded-lg bg-white p-6">
        {children}
      </div>
    </div>
  ) : null
);

const AlertDialogContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-2 text-sm text-gray-500">{children}</p>
);

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex justify-end space-x-2">{children}</div>
);

const AlertDialogCancel = ({ 
  children,
  disabled = false
}: { 
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
    disabled={disabled}
  >
    {children}
  </button>
);

const AlertDialogAction = ({ 
  children,
  onClick,
  disabled = false,
  className = ''
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    className={`rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

/**
 * Toast notification for showing success/error messages
 */
const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; title: string; description?: string; variant?: string }>
  >([]);

  const toast = ({
    title,
    description,
    variant = 'default'
  }: {
    title: string;
    description?: string;
    variant?: string;
  }) => {
    // In a real implementation, this would display a toast notification
    // For now, we'll just log to console
    console.log(`Toast (${variant}):`, title, description);
  };

  return { toast };
};

/**
 * CellAction component for product row actions (edit, delete)
 */
interface CellActionProps {
  product: Product;
}

export const CellAction: React.FC<CellActionProps> = ({
  product
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /**
   * Handle product deletion
   */
  const onConfirm = async () => {
    try {
      setIsLoading(true);
      
      // Call the API to delete the product
      const result = await fakeProducts.deleteProduct(product.id);
      
      if (result.success) {
        toast({
          title: "Product deleted",
          description: `${product.name} has been successfully removed.`,
          variant: "default",
        });
        
        // Refresh the page to update the product list
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  /**
   * Navigate to the product edit page
   */
  const onEdit = () => {
    router.push(`/dashboard/products/${product.id}`);
    setShowDropdown(false);
  };

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{product.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirm} 
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='ghost' className='h-8 w-8 p-0' onClick={() => setShowDropdown(!showDropdown)}>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        {showDropdown && (
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setShowDropdown(false);
                setShowDeleteDialog(true);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </>
  );
}; 