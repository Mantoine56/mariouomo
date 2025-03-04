/**
 * Analytics Export Component
 * 
 * Higher-level component that prepares different types of analytics data for export
 * It formats data for each chart/report type and provides appropriate column definitions
 */
import React from "react";
import { ExportButton } from "./export-button";
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type definitions for the different data formats
type SalesData = { date: string; value: number }[];
type RevenueCategoryData = { name: string; value: number; color: string }[];
type CustomerData = { date: string; newCustomers: number; returningCustomers: number }[];
type ProductData = { name: string; category: string; revenue: number; orders: number }[];
type OverviewData = Record<string, { value: number; change: number }>;

/**
 * Props for the AnalyticsExport component
 */
interface AnalyticsExportProps {
  /**
   * Type of analytics data to export
   */
  type: "sales" | "revenue-category" | "customers" | "products" | "overview";

  /**
   * Period of the data (for filename)
   */
  period: string;

  /**
   * Raw data to be formatted for export
   */
  data: any;

  /**
   * Optional variant for the button
   */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";

  /**
   * Optional size for the button
   */
  size?: "default" | "sm" | "lg" | "icon";

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * A component that prepares analytics data for export based on the type
 */
export function AnalyticsExport({
  type,
  period,
  data,
  variant = "ghost",
  size = "icon",
  className = "",
}: AnalyticsExportProps) {
  // Format the period label for the filename
  const periodMap: Record<string, string> = {
    "today": "daily",
    "7d": "7day",
    "30d": "30day",
    "12m": "annual",
    "all": "all_time"
  };
  
  const periodLabel = periodMap[period] || period;

  /**
   * Format sales trend data for CSV export
   */
  const formatSalesTrendData = (salesData: SalesData): string => {
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return 'Date,Revenue\n';
    }

    // Create CSV header
    let csv = 'Date,Revenue\n';

    // Add each data point
    salesData.forEach(item => {
      csv += `${item.date},${item.value}\n`;
    });

    return csv;
  };

  /**
   * Format revenue category data for CSV export
   */
  const formatRevenueCategoryData = (revenueData: RevenueCategoryData): string => {
    if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
      return 'Category,Revenue\n';
    }

    // Create CSV header
    let csv = 'Category,Revenue\n';

    // Add each category
    revenueData.forEach(item => {
      csv += `${item.name},${item.value}\n`;
    });

    return csv;
  };

  /**
   * Format customer acquisition data for CSV export
   */
  const formatCustomerData = (customerData: CustomerData): string => {
    if (!customerData || !Array.isArray(customerData) || customerData.length === 0) {
      return 'Date,New Customers,Returning Customers\n';
    }

    // Create CSV header
    let csv = 'Date,New Customers,Returning Customers\n';

    // Add each data point
    customerData.forEach(item => {
      csv += `${item.date},${item.newCustomers},${item.returningCustomers}\n`;
    });

    return csv;
  };

  /**
   * Format product performance data for CSV export
   */
  const formatProductData = (productData: ProductData): string => {
    if (!productData || !Array.isArray(productData) || productData.length === 0) {
      return 'Product,Category,Revenue,Orders\n';
    }

    // Create CSV header
    let csv = 'Product,Category,Revenue,Orders\n';

    // Add each product
    productData.forEach(item => {
      csv += `"${item.name}","${item.category}",${item.revenue},${item.orders}\n`;
    });

    return csv;
  };

  /**
   * Format overview metrics data for CSV export
   */
  const formatOverviewData = (overviewData: OverviewData): string => {
    if (!overviewData || Object.keys(overviewData).length === 0) {
      return 'Metric,Value,Change (%)\n';
    }

    // Create CSV header
    let csv = 'Metric,Value,Change (%)\n';

    // Add each metric
    Object.entries(overviewData).forEach(([key, data]) => {
      // Format the key to be more readable (e.g., totalRevenue -> Total Revenue)
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      
      csv += `"${formattedKey}",${data.value},${data.change}\n`;
    });

    return csv;
  };

  /**
   * Configure column names for different data types
   */
  const getColumnsConfig = (): { [key: string]: string[] } => {
    return {
      sales: ['Date', 'Revenue'],
      'revenue-category': ['Category', 'Revenue'],
      customers: ['Date', 'New Customers', 'Returning Customers'],
      products: ['Product', 'Category', 'Revenue', 'Orders'],
      overview: ['Metric', 'Value', 'Change (%)'],
    };
  };

  /**
   * Generate a filename based on the data type and period
   */
  const getFileName = (): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const periodLabel = period === 'all' ? 'all-time' : period;
    
    return `mariouomo-${type}-${periodLabel}-${timestamp}.csv`;
  };

  /**
   * Handle the export action
   */
  const handleExport = () => {
    let csvContent = '';

    // Format data based on type
    switch (type) {
      case 'sales':
        csvContent = formatSalesTrendData(data as SalesData);
        break;
      case 'revenue-category':
        csvContent = formatRevenueCategoryData(data as RevenueCategoryData);
        break;
      case 'customers':
        csvContent = formatCustomerData(data as CustomerData);
        break;
      case 'products':
        csvContent = formatProductData(data as ProductData);
        break;
      case 'overview':
        csvContent = formatOverviewData(data as OverviewData);
        break;
      default:
        csvContent = 'No data\n';
    }

    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFileName());
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            aria-label={`Export ${type} data as CSV`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export as CSV</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 