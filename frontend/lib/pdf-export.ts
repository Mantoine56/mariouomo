/**
 * PDF Export Utilities
 * 
 * This file contains utility functions for exporting data to PDF format.
 * It leverages jsPDF and jspdf-autotable for generating professional PDF reports.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber, formatCurrency } from '@/lib/utils';

/**
 * Interface for table column configuration
 */
interface PDFColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

/**
 * Interface for PDF export options
 */
interface PDFExportOptions {
  /**
   * Document title
   */
  title: string;
  
  /**
   * Optional filename (without extension)
   */
  filename?: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Optional document orientation
   */
  orientation?: 'portrait' | 'landscape';
  
  /**
   * Optional custom styling
   */
  styles?: {
    headerBackgroundColor?: string;
    headerTextColor?: string;
    rowBackgroundColor?: string;
    rowTextColor?: string;
    alternateRowBackgroundColor?: string;
  };
  
  /**
   * Optional company logo URL
   */
  logoUrl?: string;
  
  /**
   * Optional footer text
   */
  footer?: string;
  
  /**
   * Optional page size
   */
  pageSize?: string;
}

/**
 * Default styles for PDF export
 */
const defaultStyles = {
  headerBackgroundColor: '#4c4e6b', // Brand color
  headerTextColor: '#ffffff',
  rowBackgroundColor: '#ffffff',
  rowTextColor: '#333333',
  alternateRowBackgroundColor: '#f9f9f9',
};

/**
 * Exports data to a PDF file
 * 
 * @param data - Array of objects to export
 * @param columns - Configuration for table columns
 * @param options - PDF export options
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: PDFColumn[],
  options: PDFExportOptions
): void {
  const {
    title,
    filename = title.toLowerCase().replace(/\s+/g, '-'),
    subtitle = '',
    orientation = 'portrait',
    styles = {},
    logoUrl = '',
    footer = '© Mario Uomo. Generated on ' + new Date().toLocaleDateString(),
    pageSize = 'a4',
  } = options;

  // Merge styles with defaults
  const mergedStyles = { ...defaultStyles, ...styles };
  
  // Initialize PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });
  
  // Add metadata
  doc.setProperties({
    title,
    subject: subtitle,
    creator: 'Mario Uomo Analytics',
    author: 'Mario Uomo',
  });
  
  // Prepare document (margins, layout, etc.)
  const pageWidth = orientation === 'portrait' ? 210 : 297;
  const pageHeight = orientation === 'portrait' ? 297 : 210;
  const margins = { top: 15, right: 15, bottom: 15, left: 15 };
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, margins.left, margins.top + 5);
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, margins.left, margins.top + 12);
  }
  
  // Prepare table data
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(item => {
    return columns.map(col => {
      const value = item[col.dataKey];
      return col.format ? col.format(value) : value;
    });
  });
  
  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: subtitle ? margins.top + 17 : margins.top + 10,
    margin: margins,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: mergedStyles.headerBackgroundColor,
      textColor: mergedStyles.headerTextColor,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: mergedStyles.alternateRowBackgroundColor,
    },
    bodyStyles: {
      textColor: mergedStyles.rowTextColor,
    },
    didDrawPage: (data) => {
      // Add footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          footer,
          margins.left,
          pageHeight - 5
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margins.right - 25,
          pageHeight - 5
        );
      }
    },
  });
  
  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Formats data for PDF export based on common analytics data types
 * 
 * @param type - Type of analytics data
 * @param data - The data to format
 * @param period - Time period for report title
 * @param options - Additional PDF options
 */
export function exportAnalyticsToPDF(
  type: string,
  data: any,
  period: string = '',
  options: Partial<PDFExportOptions> = {}
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const periodLabel = getPeriodLabel(period);
  
  // Default filename based on type and period
  const defaultFilename = `mariouomo-${type}-${periodLabel}-${timestamp}`;
  
  // Get columns and title based on data type
  let columns: PDFColumn[] = [];
  let title = '';
  
  switch (type) {
    case 'sales':
      title = 'Sales Trend Report';
      columns = [
        { header: 'Date', dataKey: 'date', width: 30, align: 'left' },
        { 
          header: 'Revenue', 
          dataKey: 'value', 
          width: 30, 
          align: 'right',
          format: (value) => formatCurrency(value) 
        }
      ];
      break;
      
    case 'revenue-category':
      title = 'Revenue by Category Report';
      columns = [
        { header: 'Category', dataKey: 'name', width: 40, align: 'left' },
        { 
          header: 'Revenue', 
          dataKey: 'value', 
          width: 30, 
          align: 'right',
          format: (value) => formatCurrency(value) 
        }
      ];
      break;
      
    case 'customers':
      title = 'Customer Acquisition Report';
      columns = [
        { header: 'Date', dataKey: 'date', width: 30, align: 'left' },
        { 
          header: 'New Customers', 
          dataKey: 'newCustomers', 
          width: 30, 
          align: 'right',
          format: (value) => formatNumber(value) 
        },
        { 
          header: 'Returning Customers', 
          dataKey: 'returningCustomers', 
          width: 30, 
          align: 'right',
          format: (value) => formatNumber(value) 
        }
      ];
      break;
      
    case 'products':
      title = 'Product Performance Report';
      columns = [
        { header: 'Product', dataKey: 'name', width: 50, align: 'left' },
        { header: 'Category', dataKey: 'category', width: 30, align: 'left' },
        { 
          header: 'Revenue', 
          dataKey: 'revenue', 
          width: 30, 
          align: 'right',
          format: (value) => formatCurrency(value) 
        },
        { 
          header: 'Orders', 
          dataKey: 'orders', 
          width: 20, 
          align: 'right',
          format: (value) => formatNumber(value) 
        }
      ];
      break;
      
    case 'overview':
      title = 'Performance Overview Report';
      // Transform the overview data into an array format for the table
      data = Object.entries(data).map(([key, metrics]: [string, any]) => ({
        metric: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase()),
        value: metrics.value,
        change: metrics.change
      }));
      
      columns = [
        { header: 'Metric', dataKey: 'metric', width: 50, align: 'left' },
        { 
          header: 'Value', 
          dataKey: 'value', 
          width: 30, 
          align: 'right',
          format: (value) => {
            // Format based on metric type (can be enhanced with more specific formatting)
            if (typeof value === 'number') {
              return String(value).includes('.') ? formatNumber(value, 2) : formatNumber(value);
            }
            return value;
          } 
        },
        { 
          header: 'Change (%)', 
          dataKey: 'change', 
          width: 30, 
          align: 'right',
          format: (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%` 
        }
      ];
      break;
      
    default:
      title = 'Analytics Report';
      columns = Object.keys(data[0] || {}).map(key => ({
        header: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase()),
        dataKey: key
      }));
  }
  
  // Create subtitle with period information
  const subtitle = `Data period: ${periodLabel}`;
  
  // Merge with user options
  const finalOptions: PDFExportOptions = {
    title,
    subtitle,
    filename: defaultFilename,
    orientation: type === 'products' ? 'landscape' : 'portrait',
    ...options,
  };
  
  // Export to PDF
  exportToPDF(data, columns, finalOptions);
}

/**
 * Helper function to get a formatted period label
 */
function getPeriodLabel(period: string): string {
  const periodMap: Record<string, string> = {
    "today": "Today",
    "yesterday": "Yesterday",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last Quarter",
    "ytd": "Year to Date",
    "all": "All Time"
  };
  
  return periodMap[period] || period;
} 