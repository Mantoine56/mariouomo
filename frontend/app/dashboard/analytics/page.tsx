"use client";

import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  BarChart3, 
  LineChart, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package, 
  RefreshCw,
  UserPlus,
  UserCheck,
  FileText,
  Download,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SalesTrendChart from "@/components/analytics/sales-trend-chart";
import RevenueCategoryChart from "@/components/analytics/revenue-category-chart";
import CustomerAcquisitionChart from "@/components/analytics/customer-acquisition-chart";
import { AnalyticsExport } from "@/components/analytics/analytics-export";
import { ExportButton } from "@/components/analytics/export-button";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { AnalyticsApi, SalesAnalytics, CustomerAnalytics, CategoryPerformance, ProductPerformance } from "@/lib/analytics-api";
import { AnalyticsApiDev } from "@/lib/analytics-api-dev";
import { getPeriodDates, formatDateRange } from "@/lib/date-utils";
import { config } from "@/lib/config";

const API = process.env.NODE_ENV === 'development' ? AnalyticsApiDev : AnalyticsApi;

/**
 * Analytics Dashboard Page
 * 
 * A comprehensive dashboard with key business metrics, charts, and reports
 * for monitoring store performance and making data-driven decisions.
 * Connects to backend API to fetch real analytics data.
 */
export default function AnalyticsDashboard() {
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState<string>(config.analytics.defaultPeriod);
  const [reportType, setReportType] = useState<string>("overview");
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for analytics data
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryPerformance | null>(null);
  const [productData, setProductData] = useState<ProductPerformance | null>(null);
  
  // Derived data for displaying metrics
  const keyMetrics = {
    totalRevenue: { 
      value: salesData?.total_revenue || 0, 
      change: salesData?.revenue_change_percentage || 0 
    },
    orders: { 
      value: salesData?.total_orders || 0, 
      change: salesData?.orders_change_percentage || 0 
    },
    customers: { 
      value: customerData?.total_customers || 0, 
      change: customerData?.customer_growth_rate || 0 
    },
    conversionRate: { 
      value: 3.45, // Placeholder
      change: -0.5  // Placeholder
    }
  };

  // Transform sales data for chart
  const salesChartData = salesData?.daily_revenue.map(item => ({
    date: item.date,
    value: item.revenue
  })) || [];

  // Transform category data for chart
  const revenueData = categoryData?.categories.map((cat, index) => ({
    category: cat.name,
    revenue: cat.revenue,
    // Assign colors from a predefined palette
    color: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"][index % 6]
  })) || [];

  // Transform customer data for acquisition chart
  const customerAcquisitionData = customerData?.daily_acquisition.map(item => ({
    date: item.date,
    newCustomers: item.new_customers,
    returningCustomers: item.returning_customers
  })) || [];

  // Transform product data for top products
  const topProducts = productData?.products.slice(0, 5).map(product => ({
    name: product.name,
    category: product.category,
    revenue: product.revenue,
    orders: product.orders
  })) || [];
  
  /**
   * Load all analytics data based on the selected time period
   */
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get date range from time period
      const { startDate, endDate } = getPeriodDates(timePeriod);
      
      // Fetch data in parallel
      const [salesResult, customerResult, categoryResult, productResult] = await Promise.all([
        API.getSales(startDate, endDate),
        API.getCustomers(startDate, endDate),
        API.getCategoryPerformance(startDate, endDate),
        API.getProductPerformance(startDate, endDate)
      ]);
      
      // Update state with API results
      setSalesData(salesResult);
      setCustomerData(customerResult);
      setCategoryData(categoryResult);
      setProductData(productResult);
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or when time period changes
  useEffect(() => {
    loadAnalyticsData();
    
    // Setup polling for real-time updates if enabled
    if (config.features.enableRealtimeUpdates) {
      const interval = setInterval(() => {
        loadAnalyticsData();
      }, config.analytics.polling.dashboardRefreshInterval);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [timePeriod]);
  
  // Handler for manually refreshing data
  const handleRefreshData = () => {
    loadAnalyticsData();
  };
  
  // Format percentage for display
  const formatPercentage = (percent: number): string => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // If there's an error, show the error display with retry option
  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay 
          title="Analytics Data Error"
          message={error}
          onRetry={loadAnalyticsData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {timePeriod && !isLoading ? formatDateRange(
              getPeriodDates(timePeriod).startDate,
              getPeriodDates(timePeriod).endDate
            ) : 'Loading date range...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={timePeriod} 
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              {config.analytics.periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <AnalyticsExport 
            type="overview"
            period={timePeriod}
            data={{
              keyMetrics: keyMetrics,
              salesData: salesChartData,
              revenueData: revenueData,
              customerData: customerAcquisitionData,
              topProducts: topProducts
            }}
          />
        </div>
      </div>

      {/* Show loading state for the entire dashboard if loading initially */}
      {isLoading && !salesData ? (
        <Loading message="Loading analytics data..." minHeight="600px" />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Revenue" 
              value={formatCurrency(keyMetrics.totalRevenue.value)}
              change={keyMetrics.totalRevenue.change}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricCard 
              title="Orders" 
              value={keyMetrics.orders.value.toString()}
              change={keyMetrics.orders.change}
              icon={<ShoppingCart className="h-4 w-4" />}
            />
            <MetricCard 
              title="Customers" 
              value={keyMetrics.customers.value.toString()}
              change={keyMetrics.customers.change}
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard 
              title="Conversion Rate" 
              value={formatPercentage(keyMetrics.conversionRate.value)}
              change={keyMetrics.conversionRate.change}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
         
          {/* Report Tabs */}
          <Tabs defaultValue="overview" className="w-full" onValueChange={setReportType}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Sales performance over time</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <SalesTrendChart 
                        period={timePeriod}
                        isLoading={isLoading}
                        trend="up"
                        percentageChange={keyMetrics.totalRevenue.change}
                        data={salesChartData}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue by Category */}
                <div>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle>Revenue by Category</CardTitle>
                        <CardDescription>
                          Distribution of revenue across product categories
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <RevenueCategoryChart 
                        period={timePeriod}
                        isLoading={isLoading}
                        data={revenueData}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Products */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Top Products</CardTitle>
                      <CardDescription>Best-selling products by revenue</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.map((product, i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-[35%] truncate font-medium">
                            {product.name}
                          </div>
                          <div className="w-[20%] text-muted-foreground">
                            {product.category}
                          </div>
                          <div className="w-[25%] text-right">
                            {formatCurrency(product.revenue)}
                          </div>
                          <div className="w-[20%] text-right">
                            {product.orders} orders
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Acquisition */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Customer Acquisition</CardTitle>
                      <CardDescription>New vs returning customers</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CustomerAcquisitionChart
                      period={timePeriod}
                      isLoading={isLoading}
                      data={customerAcquisitionData}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

/**
 * MetricCard Component
 * 
 * A card displaying a key metric with title, value, and change percentage
 */
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  invertColor?: boolean;
}

function MetricCard({ title, value, change, icon, invertColor = false }: MetricCardProps) {
  // Determine if change is positive (based on invertColor)
  const isPositive = invertColor ? change < 0 : change > 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "bg-primary/10 p-2 rounded-full",
              isPositive ? "bg-green-100" : "bg-red-100"
            )}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            isPositive ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400" : 
                      "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400"
          )}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 