/**
 * Pagination Component
 * 
 * This component provides paginated navigation for lists and tables.
 */
import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxDisplayed?: number;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxDisplayed = 5,
  disabled = false,
  className
}: PaginationProps) {
  // Generate page numbers to display
  const generatePageNumbers = () => {
    // If we have fewer pages than our max display, show all pages
    if (totalPages <= maxDisplayed) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate the range to display with current page centered when possible
    const halfMax = Math.floor(maxDisplayed / 2);
    let start = Math.max(currentPage - halfMax, 1);
    let end = Math.min(start + maxDisplayed - 1, totalPages);
    
    // If we're at the end, shift the start to show correct number of pages
    if (end === totalPages) {
      start = Math.max(end - maxDisplayed + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const pageNumbers = generatePageNumbers();
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* First page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
      )}
      
      {/* Previous page button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {/* Page number buttons */}
      {pageNumbers.map(pageNumber => (
        <Button
          key={pageNumber}
          variant={currentPage === pageNumber ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageNumber)}
          disabled={disabled}
        >
          {pageNumber}
        </Button>
      ))}
      
      {/* Next page button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
      
      {/* Last page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      )}
    </div>
  );
} 