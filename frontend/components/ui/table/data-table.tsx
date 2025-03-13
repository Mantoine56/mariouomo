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
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  Row,
  OnChangeFn,
  Column
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpDown, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * DataTable component for displaying data in a table format with pagination, sorting, and filtering
 * 
 * @param columns - Column definitions for the table
 * @param data - Data to display in the table
 * @param totalItems - Total number of items across all pages
 * @param pageSizeOptions - Options for number of items per page
 * @param currentPage - Current page index (0-based)
 * @param pageSize - Number of items per page
 * @param onPageChange - Callback for page changes
 * @param onPageSizeChange - Callback for page size changes
 * @param onSortingChange - Callback for sorting changes
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
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  // Selection props
  enableRowSelection?: boolean;
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: (selectedRows: Record<string, boolean>) => void;
  renderBulkActions?: (selectedRows: Record<string, boolean>) => React.ReactNode;
}

/**
 * Filter component for columns
 */
function ColumnFilterPopover<TData, TValue>({
  column,
  data,
}: {
  column: Column<TData, TValue>;
  data: TData[];
}) {
  const [value, setValue] = useState<string>(
    (column.getFilterValue() as string) ?? ''
  );
  // Add state to control the popover
  const [open, setOpen] = useState(false);

  const handleFilterChange = (newValue: string) => {
    setValue(newValue);
    column.setFilterValue(newValue);
  };

  // Function to apply filter and close popover
  const applyFilter = () => {
    column.setFilterValue(value);
    setOpen(false); // Close the popover
  };

  // Function to reset filter and close popover
  const resetFilter = () => {
    setValue('');
    column.setFilterValue('');
    setOpen(false); // Close the popover
  };

  // Get unique values for this column for checkbox filters
  const uniqueValues = new Set<string>();
  
  // Extract unique values directly from data
  data.forEach((row: any) => {
    const cellValue = row[column.id];
    if (cellValue !== null && cellValue !== undefined && typeof cellValue === 'string') {
      uniqueValues.add(cellValue);
    }
  });
  
  // Sort values alphabetically
  const sortedValues = Array.from(uniqueValues).sort();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 w-8 p-0 hover:bg-muted",
            column.getIsFiltered() && "bg-muted text-primary"
          )}
          aria-label="Filter"
        >
          <Filter className="h-4 w-4" />
          {column.getIsFiltered() && (
            <span className="sr-only">Filtered</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3" align="start">
        <div className="space-y-2">
          <h4 className="font-medium">Filter by {column.id}</h4>
          <div className="pt-2">
            {sortedValues.length > 0 ? (
              // Checkbox list for columns with enumerable values
              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={value}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  />
                </div>
                {sortedValues.length <= 10 && sortedValues.map((val) => (
                  <div key={val} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${column.id}-${val}`}
                      checked={value?.includes(val) || false}
                      onChange={(e) => {
                        // Toggle filter value
                        if (e.target.checked) {
                          handleFilterChange(val);
                        } else {
                          handleFilterChange('');
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={`${column.id}-${val}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {val}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              // Text input for columns without enumerable values or with many values
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Filter..."
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={value}
                  onChange={(e) => handleFilterChange(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 h-7"
                onClick={resetFilter}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                className="px-3 py-1 h-7"
                onClick={applyFilter}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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
  onSortingChange,
  onFiltersChange,
  // Selection props
  enableRowSelection = false,
  selectedRows: externalSelectedRows,
  onSelectedRowsChange,
  renderBulkActions
}: DataTableProps<TData, TValue>) {
  // Pagination state using React useState
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  // Filtering state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // Internal selection state (if not controlled)
  const [internalSelectedRows, setInternalSelectedRows] = useState<Record<string, boolean>>({});

  // Use external pagination state if provided
  const currentPageIndex = externalPageIndex !== undefined ? externalPageIndex : pageIndex;
  const currentPageSize = externalPageSize !== undefined ? externalPageSize : pageSize;
  // Use external selection state if provided
  const currentSelectedRows = externalSelectedRows !== undefined ? externalSelectedRows : internalSelectedRows;

  const pageCount = Math.ceil(totalItems / currentPageSize);
  
  // Handle sorting changes
  const handleSortingChange = (updatedSorting: SortingState) => {
    setSorting(updatedSorting);
    if (onSortingChange) {
      onSortingChange(updatedSorting);
    }
    // Reset to first page when sorting changes
    if (onPageChange) {
      onPageChange(0);
    } else {
      setPageIndex(0);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (updatedFilters: ColumnFiltersState) => {
    setColumnFilters(updatedFilters);
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
    // Reset to first page when filters change
    if (onPageChange) {
      onPageChange(0);
    } else {
      setPageIndex(0);
    }
  };
  
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: onSortingChange 
      ? ((updater) => {
          const newValue = typeof updater === 'function'
            ? updater(sorting)
            : updater;
          handleSortingChange(newValue);
        }) as OnChangeFn<SortingState>
      : setSorting,
    onColumnFiltersChange: onFiltersChange 
      ? ((updater) => {
          const newValue = typeof updater === 'function'
            ? updater(columnFilters)
            : updater;
          handleFiltersChange(newValue);
        }) as OnChangeFn<ColumnFiltersState>
      : setColumnFilters,
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

  // Function to display active filters
  const getActiveFilters = () => {
    return table.getState().columnFilters
      .filter(filter => 
        filter.value !== undefined && 
        filter.value !== '' && 
        filter.value !== null
      )
      .map(filter => {
        const column = table.getColumn(filter.id);
        return {
          id: filter.id,
          value: filter.value,
          label: column?.columnDef?.header as string || filter.id
        };
      });
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Active Filters Bar */}
      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          <div className="text-sm text-muted-foreground mr-2 py-1">Filters:</div>
          {getActiveFilters().map(filter => (
            <Badge 
              key={filter.id} 
              variant="outline"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>{filter.label}: {typeof filter.value === 'string' ? filter.value : 'Active'}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => table.getColumn(filter.id)?.setFilterValue('')}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {getActiveFilters().length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-sm"
              onClick={() => {
                table.resetColumnFilters();
              }}
            >
              Reset all
            </Button>
          )}
        </div>
      )}

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
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between gap-1">
                          <div 
                            className={
                              header.column.getCanSort() 
                                ? "flex items-center gap-1 cursor-pointer select-none"
                                : ""
                            }
                            onClick={header.column.getCanSort() 
                              ? header.column.getToggleSortingHandler() 
                              : undefined}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <div className="ml-1">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </div>
                            )}
                          </div>
                          {/* Filter button for columns that can be filtered */}
                          {header.column.getCanFilter() && (
                            <div className="flex items-center ml-2">
                              <ColumnFilterPopover column={header.column} data={data} />
                            </div>
                          )}
                        </div>
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