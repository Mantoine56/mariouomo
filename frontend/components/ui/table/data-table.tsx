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
  useReactTable,
  Row
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
 * @param enableRowSelection - Enable row selection functionality
 * @param selectedRows - Currently selected rows (controlled mode)
 * @param onSelectedRowsChange - Callback when selected rows change
 * @param renderBulkActions - Render function for bulk actions when rows are selected
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
  // Selection props
  enableRowSelection?: boolean;
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: (selectedRows: Record<string, boolean>) => void;
  renderBulkActions?: (selectedRows: Record<string, boolean>) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  currentPage: externalPageIndex,
  pageSize: externalPageSize,
  onPageChange,
  onPageSizeChange,
  // Selection props
  enableRowSelection = false,
  selectedRows: externalSelectedRows,
  onSelectedRowsChange,
  renderBulkActions
}: DataTableProps<TData, TValue>) {
  // Pagination state using React useState
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // Internal selection state (if not controlled)
  const [internalSelectedRows, setInternalSelectedRows] = useState<Record<string, boolean>>({});

  // Use external pagination state if provided
  const currentPageIndex = externalPageIndex !== undefined ? externalPageIndex : pageIndex;
  const currentPageSize = externalPageSize !== undefined ? externalPageSize : pageSize;
  // Use external selection state if provided
  const currentSelectedRows = externalSelectedRows !== undefined ? externalSelectedRows : internalSelectedRows;

  const pageCount = Math.ceil(totalItems / currentPageSize);
  
  // Row selection handlers
  const handleRowSelectionChange = (rowId: string, isSelected: boolean) => {
    const newSelectedRows = { ...currentSelectedRows, [rowId]: isSelected };
    
    if (!isSelected) {
      // Remove the row if it's being deselected
      delete newSelectedRows[rowId];
    }
    
    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };
  
  // Select/deselect all rows on current page
  const handleSelectAllRows = (isSelected: boolean) => {
    const newSelectedRows = { ...currentSelectedRows };
    
    data.forEach((row: any) => {
      const rowId = row.id as string;
      if (isSelected) {
        newSelectedRows[rowId] = true;
      } else {
        delete newSelectedRows[rowId];
      }
    });
    
    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };
  
  // Check if all rows on current page are selected
  const areAllRowsSelected = data.length > 0 && data.every((row: any) => 
    currentSelectedRows[row.id as string]
  );
  
  // Get count of selected rows
  const selectedRowsCount = Object.keys(currentSelectedRows).length;
  
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
      {/* Bulk Actions Bar */}
      {enableRowSelection && selectedRowsCount > 0 && renderBulkActions && (
        <div className="bg-muted/80 py-2 px-4 rounded-md flex items-center justify-between">
          <div className="text-sm font-medium">
            {selectedRowsCount} {selectedRowsCount === 1 ? 'item' : 'items'} selected
          </div>
          <div className="flex gap-2">
            {renderBulkActions(currentSelectedRows)}
          </div>
        </div>
      )}
    
      {/* Table */}
      <div className='w-full'>
        <div className='w-full overflow-x-auto rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {/* Select All Checkbox Column */}
                  {enableRowSelection && (
                    <TableHead className="w-[50px] bg-gray-50 p-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={areAllRowsSelected}
                        onChange={(e) => handleSelectAllRows(e.target.checked)}
                      />
                    </TableHead>
                  )}
                  {/* Regular Columns */}
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
                    {/* Row Selection Checkbox */}
                    {enableRowSelection && (
                      <TableCell className="w-[50px] p-0 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={Boolean(currentSelectedRows[(row.original as any).id])}
                          onChange={(e) => handleRowSelectionChange((row.original as any).id, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    {/* Regular Row Cells */}
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
                    colSpan={enableRowSelection ? columns.length + 1 : columns.length}
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