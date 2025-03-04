/**
 * CSV Export Utilities
 * 
 * This file contains utility functions for exporting data to CSV format.
 * It provides methods to convert data arrays to CSV strings and download them as files.
 */

/**
 * Converts an array of objects to a CSV string
 * 
 * @param data - Array of objects to convert
 * @param columns - Optional column configuration with headers
 * @returns CSV formatted string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; header: string }[]
): string {
  if (!data || data.length === 0) return '';

  // If columns not provided, generate from first item's keys
  const columnConfig = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    header: key as string
  }));

  // Create the CSV header row
  const header = columnConfig.map(column => formatCSVField(column.header)).join(',');

  // Create the data rows
  const rows = data.map(item => {
    return columnConfig
      .map(column => {
        const value = item[column.key];
        return formatCSVField(value);
      })
      .join(',');
  });

  // Combine header and rows
  return [header, ...rows].join('\n');
}

/**
 * Format a value for CSV, handling special characters
 * 
 * @param value - The value to format
 * @returns Properly formatted CSV field
 */
function formatCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Convert to string and handle special cases
  const stringValue = String(value);
  
  // If the value contains commas, quotes, or newlines, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Double any quotes within the value
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Downloads data as a CSV file
 * 
 * @param data - CSV string to download
 * @param filename - Name of the file (without extension)
 */
export function downloadCSV(data: string, filename: string): void {
  // Create a blob with the CSV data
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  
  // Append the link to the body
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data directly to a CSV file
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param columns - Optional column configuration with headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename);
} 