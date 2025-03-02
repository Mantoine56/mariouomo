'use client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * DataTable component for displaying data in a table format with pagination
 * 
 * @param columns - Column definitions for the table
 * @param data - Data to display in the table
 * @param totalItems - Total number of items across all pages
 * @param pageSizeOptions - Options for number of items per page
 * @param currentPage - Current page index (0-based)
 * @param pageSize - Number of items per page
 * @param onPageChange - Callback for page changes
 * @param onPageSizeChange - Callback for page size changes
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  currentPage: externalPageIndex,
  pageSize: externalPageSize,
  onPageChange,
  onPageSizeChange
}: DataTableProps<TData, TValue>) {
  // Pagination state using React useState
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Use external pagination state if provided
  const currentPageIndex = externalPageIndex !== undefined ? externalPageIndex : pageIndex;
  const currentPageSize = externalPageSize !== undefined ? externalPageSize : pageSize;

  const pageCount = Math.ceil(totalItems / currentPageSize);
  
  // Initialize table with React Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      if (onPageChange) {
        onPageChange(currentPageIndex - 1);
      } else {
        setPageIndex(currentPageIndex - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pageCount - 1) {
      if (onPageChange) {
        onPageChange(currentPageIndex + 1);
      } else {
        setPageIndex(currentPageIndex + 1);
      }
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setPageSize(newSize);
      setPageIndex(0); // Reset to first page when changing page size
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Table */}
      <div className='w-full'>
        <div className='w-full overflow-x-auto rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50 p-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 border-b"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-2'>
        {/* Page info */}
        <div className='text-sm text-muted-foreground'>
          {totalItems > 0 ? (
            <>
              Showing {currentPageIndex * currentPageSize + 1} to{' '}
              {Math.min((currentPageIndex + 1) * currentPageSize, totalItems)}{' '}
              of {totalItems} entries
            </>
          ) : (
            'No entries found'
          )}
        </div>

        {/* Pagination controls */}
        <div className='flex items-center gap-6'>
          {/* Rows per page */}
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium whitespace-nowrap'>
              Rows per page
            </p>
            <select
              className='h-8 w-16 rounded-md border border-input bg-transparent px-3 py-1 text-sm'
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Page number display */}
          <div className='flex min-w-[100px] items-center justify-center text-sm font-medium'>
            Page {currentPageIndex + 1} of {pageCount || 1}
          </div>

          {/* Navigation buttons */}
          <div className='flex items-center gap-2'>
            <Button
              aria-label='Go to previous page'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={handlePreviousPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              aria-label='Go to next page'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={handleNextPage}
              disabled={currentPageIndex >= pageCount - 1}
            >
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 