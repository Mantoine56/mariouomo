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
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// Import real API interface
import { Order, OrderStatus, PaymentStatus } from '@/lib/order-api';

/**
 * Get appropriate status badge variant based on order status
 */
const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.PROCESSING:
    case OrderStatus.CONFIRMED:
      return 'default';
    case OrderStatus.SHIPPED:
      return 'secondary';
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Get appropriate payment status badge variant
 */
const getPaymentStatusVariant = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'success';
    case PaymentStatus.PENDING:
      return 'warning';
    case PaymentStatus.REFUNDED:
      return 'default';
    case PaymentStatus.FAILED:
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
 * Get customer name from customer object
 */
const getCustomerName = (order: Order) => {
  if (order.customer) {
    return `${order.customer.first_name} ${order.customer.last_name}`;
  }
  return 'Unknown Customer';
};

/**
 * Get customer email from customer object
 */
const getCustomerEmail = (order: Order) => {
  return order.customer?.email || 'No email';
};

/**
 * Cell action component for order row actions
 */
const CellAction = ({ 
  order, 
  onStatusChange
}: { 
  order: Order;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}) => {
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
        
        {/* Status update dropdown items */}
        {onStatusChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            
            {order.status !== OrderStatus.CONFIRMED && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, OrderStatus.CONFIRMED)}>
                Mark as Confirmed
              </DropdownMenuItem>
            )}
            
            {order.status !== OrderStatus.PROCESSING && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, OrderStatus.PROCESSING)}>
                Mark as Processing
              </DropdownMenuItem>
            )}
            
            {order.status !== OrderStatus.SHIPPED && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, OrderStatus.SHIPPED)}>
                Mark as Shipped
              </DropdownMenuItem>
            )}
            
            {order.status !== OrderStatus.DELIVERED && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, OrderStatus.DELIVERED)}>
                Mark as Delivered
              </DropdownMenuItem>
            )}
            
            {order.status !== OrderStatus.CANCELLED && (
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, OrderStatus.CANCELLED)}
                className="text-red-600"
              >
                Cancel Order
              </DropdownMenuItem>
            )}
            
            {order.status !== OrderStatus.REFUNDED && (
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, OrderStatus.REFUNDED)}
                className="text-amber-600"
              >
                Mark as Refunded
              </DropdownMenuItem>
            )}
          </>
        )}
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
        {row.original.id.substring(0, 8)}...
      </Link>
    )
  },
  
  // Customer column
  {
    accessorKey: 'customer_id',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{getCustomerName(row.original)}</div>
        <div className="text-sm text-gray-500">{getCustomerEmail(row.original)}</div>
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
        {row.original.items?.length || 0}
      </div>
    )
  },
  
  // Actions column
  {
    id: 'actions',
    cell: ({ row, table }) => {
      // @ts-ignore - access the onStatusChange prop from the parent component
      const { onStatusChange } = table.options.meta || {};
      return <CellAction order={row.original} onStatusChange={onStatusChange} />;
    }
  }
]; 