"use client";

import { useState } from "react";
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
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SalesTrendChart from "@/components/analytics/sales-trend-chart";
import RevenueCategoryChart from "@/components/analytics/revenue-category-chart";
import CustomerAcquisitionChart from "@/components/analytics/customer-acquisition-chart";
import { AnalyticsExport } from "@/components/analytics/analytics-export";

/**
 * Analytics Dashboard Page
 * 
 * A comprehensive dashboard with key business metrics, charts, and reports
 * for monitoring store performance and making data-driven decisions.
 */
export default function AnalyticsDashboard() {
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState<string>("7d");
  const [reportType, setReportType] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mock data for key metrics
  const keyMetrics = {
    totalRevenue: { value: 24685.41, change: 12.5 },
    orders: { value: 356, change: 8.2 },
    customers: { value: 249, change: 14.3 },
    conversionRate: { value: 3.45, change: -0.5 }
  };

  // Mock data for sales trend
  const salesData = [
    { date: "Jan 1", value: 1200 },
    { date: "Jan 2", value: 1300 },
    { date: "Jan 3", value: 1100 },
    { date: "Jan 4", value: 1500 },
    { date: "Jan 5", value: 1400 },
    { date: "Jan 6", value: 1600 },
    { date: "Jan 7", value: 1750 }
  ];

  // Mock data for revenue by category
  const revenueData = [
    { category: "Shoes", revenue: 12420, color: "#FF6384" },
    { category: "Clothing", revenue: 8240, color: "#36A2EB" },
    { category: "Accessories", revenue: 2860, color: "#FFCE56" },
    { category: "Other", revenue: 1165, color: "#4BC0C0" }
  ];

  // Mock data for customer metrics
  const customerMetrics = {
    newCustomers: 156,
    newCustomersChange: 12.5,
    avgOrderValue: 98.75,
    avgOrderValueChange: 4.2,
    returnRate: 8.3,
    returnRateChange: -2.1,
    repeatPurchase: 27.8,
    repeatPurchaseChange: 5.6,
    // Add formatted data for export in the correct structure
    data: [
      { date: "Jan 1", newCustomers: 22, returningCustomers: 10 },
      { date: "Jan 2", newCustomers: 18, returningCustomers: 12 },
      { date: "Jan 3", newCustomers: 25, returningCustomers: 15 },
      { date: "Jan 4", newCustomers: 20, returningCustomers: 18 },
      { date: "Jan 5", newCustomers: 23, returningCustomers: 14 },
      { date: "Jan 6", newCustomers: 28, returningCustomers: 16 },
      { date: "Jan 7", newCustomers: 20, returningCustomers: 20 }
    ]
  };

  // Mock data for top products
  const topProducts = [
    { name: "Air Max 270", category: "Shoes", revenue: 5840, orders: 73 },
    { name: "Dri-FIT T-Shirt", category: "Clothing", revenue: 3240, orders: 108 },
    { name: "Elite Socks", category: "Accessories", revenue: 1250, orders: 125 },
    { name: "Pegasus 38", category: "Shoes", revenue: 4200, orders: 56 },
    { name: "Tech Fleece Hoodie", category: "Clothing", revenue: 3780, orders: 42 }
  ];
  
  // Handler for refreshing data
  const handleRefreshData = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };
  
  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  // Handler for time period change
  const handlePeriodChange = (value: string) => {
    setTimePeriod(value);
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your store performance and make data-driven decisions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            defaultValue={timePeriod} 
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last quarter</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Export button for overview metrics */}
          <AnalyticsExport
            type="overview"
            period={timePeriod}
            data={keyMetrics}
            size="icon"
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isLoading && "animate-spin"
            )} />
          </Button>
        </div>
      </div>

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
                  {/* Add Export button for sales trend data */}
                  <AnalyticsExport
                    type="sales"
                    period={timePeriod}
                    data={salesData}
                    size="sm"
                  />
                </CardHeader>
                <CardContent>
                  <SalesTrendChart 
                    period={timePeriod}
                    isLoading={isLoading}
                    trend="up"
                    percentageChange={12.5}
                    data={salesData}
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
                    <CardDescription>Category breakdown</CardDescription>
                  </div>
                  {/* Add Export button for revenue category data */}
                  <AnalyticsExport
                    type="revenue-category"
                    period={timePeriod}
                    data={revenueData}
                    size="sm"
                  />
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
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{product.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Acquisition and behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">New Customers</p>
                      <p className="text-2xl font-bold">{customerMetrics.newCustomers}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        customerMetrics.newCustomersChange > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {customerMetrics.newCustomersChange > 0 ? "+" : ""}
                        {formatPercentage(customerMetrics.newCustomersChange)}
                      </p>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(customerMetrics.avgOrderValue)}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        customerMetrics.avgOrderValueChange > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {customerMetrics.avgOrderValueChange > 0 ? "+" : ""}
                        {formatPercentage(customerMetrics.avgOrderValueChange)}
                      </p>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">Return Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(customerMetrics.returnRate)}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        customerMetrics.returnRateChange < 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {customerMetrics.returnRateChange > 0 ? "+" : ""}
                        {formatPercentage(customerMetrics.returnRateChange)}
                      </p>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">Repeat Purchase</p>
                      <p className="text-2xl font-bold">{formatPercentage(customerMetrics.repeatPurchase)}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        customerMetrics.repeatPurchaseChange > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {customerMetrics.repeatPurchaseChange > 0 ? "+" : ""}
                        {formatPercentage(customerMetrics.repeatPurchaseChange)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Sales Performance</CardTitle>
                    <CardDescription>Revenue, orders and trends</CardDescription>
                  </div>
                  {/* Add Export button for sales data */}
                  <AnalyticsExport
                    type="sales"
                    period={timePeriod}
                    data={salesData}
                    size="sm"
                  />
                </CardHeader>
                <CardContent>
                  <SalesTrendChart 
                    period={timePeriod}
                    isLoading={isLoading}
                    trend="up"
                    percentageChange={12.5}
                    data={salesData}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Revenue by Category</CardTitle>
                    <CardDescription>Category breakdown</CardDescription>
                  </div>
                  {/* Add Export button for revenue category data */}
                  <AnalyticsExport
                    type="revenue-category"
                    period={timePeriod}
                    data={revenueData}
                    size="sm"
                  />
                </CardHeader>
                <CardContent>
                  <RevenueCategoryChart 
                    title="Revenue by Category" 
                    description="Category breakdown"
                    period={timePeriod}
                    isLoading={isLoading}
                    chartType="bar"
                    data={revenueData}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales Channels</CardTitle>
                  <CardDescription>Revenue by sales channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mb-2" />
                      <p>Sales Channel Chart</p>
                      <p className="text-sm">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Customer Acquisition & Retention</CardTitle>
                  <CardDescription>New vs. returning customers</CardDescription>
                </div>
                {/* Add Export button for customer data */}
                <AnalyticsExport
                  type="customers"
                  period={timePeriod}
                  data={customerMetrics.data}
                  size="sm"
                />
              </CardHeader>
              <CardContent>
                <CustomerAcquisitionChart 
                  period={timePeriod}
                  isLoading={isLoading}
                  data={customerMetrics.data}
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Distribution by customer type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <UserPlus className="h-8 w-8 mb-2" />
                      <p>Customer Segments</p>
                      <p className="text-sm">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Retention Rate</CardTitle>
                  <CardDescription>Customer loyalty metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <UserCheck className="h-8 w-8 mb-2" />
                      <p>Retention Analysis</p>
                      <p className="text-sm">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products and trends</CardDescription>
              </div>
              {/* Add Export button for product data */}
              <AnalyticsExport
                type="products"
                period={timePeriod}
                data={topProducts}
                size="sm"
              />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>Product Analytics</p>
                  <p className="text-sm">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            change > 0 ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400" : 
                      "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400"
          )}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 