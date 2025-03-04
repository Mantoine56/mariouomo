/**
 * Date utility functions for analytics data
 * Provides functions for converting period selections to date ranges
 * and formatting dates for display
 */

/**
 * Convert a period selection to start and end dates
 * @param period The selected period (e.g., 'today', '7d', '30d')
 * @returns An object with startDate and endDate
 */
export function getPeriodDates(period: string): { startDate: Date, endDate: Date } {
  const endDate = new Date(); // Current date
  let startDate = new Date();
  
  switch (period) {
    case 'today':
      // Start from beginning of today
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'yesterday':
      // Start from beginning of yesterday
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case '7d':
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);
      break;
      
    case '30d':
      // Last 30 days
      startDate.setDate(startDate.getDate() - 30);
      break;
      
    case '90d':
      // Last quarter
      startDate.setDate(startDate.getDate() - 90);
      break;
      
    case 'ytd':
      // Year to date
      startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year
      break;
      
    case 'all':
      // All time (use a reasonable default, e.g., 10 years ago)
      startDate.setFullYear(startDate.getFullYear() - 10);
      break;
      
    default:
      // Default to last 7 days
      startDate.setDate(startDate.getDate() - 7);
  }
  
  return { startDate, endDate };
}

/**
 * Format a date for API requests (ISO format)
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Format a date for display (e.g., "Jan 10, 2023")
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateForDisplay(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a date to show just month and day (e.g., "Jan 10")
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateShort(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a date range for display (e.g., "Jan 10 - Jan 17, 2023")
 * @param startDate The start date
 * @param endDate The end date
 * @returns The formatted date range string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  
  if (sameYear) {
    if (sameMonth) {
      // For same month and year: "Jan 10-17, 2023"
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', { day: 'numeric' })}, ${endDate.getFullYear()}`;
    } else {
      // For same year, different month: "Jan 10 - Feb 17, 2023"
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
    }
  } else {
    // For different years: "Jan 10, 2022 - Jan 17, 2023"
    return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
  }
}

/**
 * Convert a period selection to a human-readable string
 * @param period The period string
 * @returns Human-readable description of the period
 */
export function getPeriodLabel(period: string): string {
  switch (period) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last quarter';
    case 'ytd':
      return 'Year to date';
    case 'all':
      return 'All time';
    default:
      return period;
  }
} 