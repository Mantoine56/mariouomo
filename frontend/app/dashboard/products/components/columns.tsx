'use client';
import { Product } from '@/lib/mock-api';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

/**
 * Column definitions for the product table
 * Defines how each column should be rendered
 */
export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('id')}</div>;
    }
  },
  {
    accessorKey: 'photo_url',
    header: 'IMAGE',
    cell: ({ row }) => {
      const photoUrl = row.getValue('photo_url') as string;
      if (!photoUrl) {
        return <div className="h-12 w-12 rounded-md bg-gray-100"></div>;
      }
      return (
        <div className="relative h-12 w-12">
          <Image
            src={photoUrl}
            alt={row.getValue('name') as string}
            fill
            className="rounded-md object-cover"
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('name')}</div>;
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div>{row.getValue('category')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'inventory',
    header: 'Inventory',
    cell: ({ row }) => {
      const inventory = row.getValue('inventory') as number;
      return <div className="text-center">{inventory}</div>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      let variant = 'default';
      
      if (status === 'Active') variant = 'success';
      else if (status === 'Low Stock') variant = 'warning';
      else if (status === 'Out of Stock') variant = 'destructive';
      
      return (
        <Badge variant={variant as any}>{status}</Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction product={row.original} />
  }
]; 