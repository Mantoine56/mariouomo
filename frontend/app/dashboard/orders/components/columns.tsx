'use client';

/**
 * Columns definition for the Orders table
 * 
 * Defines the structure and behavior of each column in the orders table
 * including formatting, sorting, and custom cell rendering
 */
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Order } from '@/lib/mock-api';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

/**
 * Get appropriate status badge variant based on order status
 */
const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'processing':
    case 'confirmed':
      return 'default';
    case 'shipped':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Get appropriate payment status badge variant
 */
const getPaymentStatusVariant = (status: Order['payment_status']) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'refunded':
      return 'default';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Format status text for display
 */
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Cell action component for order row actions
 */
const CellAction = ({ order }: { order: Order }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/orders/${order.id}`}>
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Update status</DropdownMenuItem>
        <DropdownMenuItem>Send notification</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          Cancel order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Column definitions for the Orders table
 */
export const columns: ColumnDef<Order>[] = [
  // Order ID column
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => (
      <Link 
        href={`/dashboard/orders/${row.original.id}`} 
        className="text-blue-600 hover:underline font-medium"
      >
        {row.original.id}
      </Link>
    )
  },
  
  // Customer column
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customer.name}</div>
        <div className="text-sm text-gray-500">{row.original.customer.email}</div>
      </div>
    )
  },
  
  // Date column
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.original.created_at)
  },
  
  // Status column
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {formatStatus(status)}
        </Badge>
      );
    }
  },
  
  // Payment status column
  {
    accessorKey: 'payment_status',
    header: 'Payment',
    cell: ({ row }) => {
      const status = row.original.payment_status;
      return (
        <Badge variant={getPaymentStatusVariant(status)}>
          {formatStatus(status)}
        </Badge>
      );
    }
  },
  
  // Total column
  {
    accessorKey: 'total_amount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="justify-end w-full"
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.total_amount)}
      </div>
    )
  },
  
  // Items column
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.items.length}
      </div>
    )
  },
  
  // Actions column
  {
    id: 'actions',
    cell: ({ row }) => <CellAction order={row.original} />
  }
]; 