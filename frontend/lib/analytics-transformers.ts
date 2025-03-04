import { formatDateShort } from './date-utils';
import { SalesAnalytics, CustomerAnalytics, CategoryPerformance, ProductPerformance } from './analytics-api';

/**
 * Transform backend sales data to format expected by the SalesTrendChart
 * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
 * to frontend/components/analytics/sales-trend-chart.tsx
 * 
 * @param backendData The sales data from the API
 * @returns Formatted data for the sales trend chart
 */
export function transformSalesData(backendData: SalesAnalytics) {
  return backendData.daily_revenue.map((item) => ({
    date: formatDateShort(new Date(item.date)),
    value: item.revenue,
  }));
}

/**
 * Transform key metrics data from sales api response
 * 
 * @param backendData The sales data from the API
 * @returns Formatted data for key metrics display
 */
export function transformKeyMetrics(backendData: SalesAnalytics) {
  return {
    totalRevenue: { 
      value: backendData.total_revenue, 
      change: backendData.revenue_change_percentage 
    },
    orders: { 
      value: backendData.total_orders, 
      change: backendData.orders_change_percentage 
    },
    averageOrder: { 
      value: backendData.average_order_value, 
      change: 0 // This would need a separate API endpoint or calculation
    }
  };
}

/**
 * Transform category data for the RevenueCategoryChart
 * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
 * to frontend/components/analytics/revenue-category-chart.tsx
 * 
 * @param backendData The category performance data from the API
 * @returns Formatted data for the revenue category chart
 */
export function transformCategoryData(backendData: CategoryPerformance) {
  // Define a set of colors to use for categories
  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#607D8B", "#4CAF50",
    "#E91E63", "#2196F3", "#FFC107", "#00BCD4",
  ];
  
  return backendData.categories.map((item, index) => ({
    name: item.name,
    value: item.revenue,
    color: colors[index % colors.length],
  }));
}

/**
 * Transform customer data for the CustomerAcquisitionChart
 * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
 * to frontend/components/analytics/customer-acquisition-chart.tsx
 * 
 * @param backendData The customer data from the API
 * @returns Formatted data for the customer acquisition chart
 */
export function transformCustomerData(backendData: CustomerAnalytics) {
  return backendData.daily_acquisition.map((item) => ({
    date: formatDateShort(new Date(item.date)),
    newCustomers: item.new_customers,
    returningCustomers: item.returning_customers,
  }));
}

/**
 * Transform product data for the product performance table
 * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
 * 
 * @param backendData The product performance data from the API
 * @returns Formatted data for the product performance table
 */
export function transformProductData(backendData: ProductPerformance) {
  return backendData.products.map((item) => ({
    name: item.name,
    category: item.category,
    revenue: item.revenue,
    orders: item.orders,
    unitsSold: item.units_sold,
    returnRate: item.return_rate,
  }));
}

/**
 * Format a number for display (adds commas and fixes decimal places)
 * 
 * @param value The number to format
 * @param decimals The number of decimal places
 * @returns The formatted number string
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a currency value for display
 * 
 * @param value The currency value to format
 * @param decimals The number of decimal places
 * @returns The formatted currency string
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a percentage for display
 * 
 * @param value The percentage value to format
 * @param decimals The number of decimal places
 * @returns The formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
} 