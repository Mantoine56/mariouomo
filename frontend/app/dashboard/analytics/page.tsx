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
  
  // Mock data for demonstration purposes
  const salesData = generateMockSalesData(timePeriod);
  const revenueData = generateMockRevenueData(timePeriod);
  const keyMetrics = generateMockKeyMetrics(timePeriod);
  const topProducts = generateMockTopProducts();
  const customerMetrics = generateMockCustomerMetrics(timePeriod);
  
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
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Gain insights into your business performance and make data-driven decisions.
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
          value={formatCurrency(keyMetrics.revenue.value)}
          change={keyMetrics.revenue.change}
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
              <SalesTrendChart 
                period={timePeriod}
                isLoading={isLoading}
                trend="up"
                percentageChange={12.5}
              />
            </div>

            {/* Revenue by Category */}
            <div>
              <RevenueCategoryChart 
                period={timePeriod}
                isLoading={isLoading}
                chartType="donut"
              />
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
            <SalesTrendChart 
              title="Detailed Sales Analysis"
              description="In-depth sales performance metrics"
              period={timePeriod}
              isLoading={isLoading}
              trend={timePeriod === "30d" ? "down" : "up"}
              percentageChange={timePeriod === "30d" ? -4.2 : 8.7}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RevenueCategoryChart 
                title="Revenue by Category" 
                description="Category breakdown"
                period={timePeriod}
                isLoading={isLoading}
                chartType="bar"
              />
              
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
            <CustomerAcquisitionChart 
              title="Customer Acquisition & Retention"
              description="New vs. returning customers"
              period={timePeriod}
              isLoading={isLoading}
            />
            
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
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Inventory and sales by product</CardDescription>
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

// Mock data generation functions
function generateMockSalesData(period: string) {
  // Generate random sales data based on the selected time period
  return {
    data: [/* data points would go here */],
    labels: [/* labels would go here */],
  };
}

function generateMockRevenueData(period: string) {
  // Generate random revenue data by category based on the selected time period
  return [
    { category: "Shirts", revenue: 24500 },
    { category: "Pants", revenue: 18300 },
    { category: "Shoes", revenue: 12800 },
    { category: "Accessories", revenue: 8700 },
    { category: "Outerwear", revenue: 15200 },
  ];
}

function generateMockKeyMetrics(period: string) {
  // Generate key metrics based on the selected time period
  return {
    revenue: { value: 124356.78, change: 12.3 },
    orders: { value: 1243, change: 8.7 },
    customers: { value: 842, change: 5.2 },
    conversionRate: { value: 3.2, change: -0.4 }
  };
}

function generateMockTopProducts() {
  // Generate top products data
  return [
    { name: "Premium Oxford Shirt", category: "Shirts", revenue: 12450, orders: 124 },
    { name: "Classic Chino Pants", category: "Pants", revenue: 9800, orders: 98 },
    { name: "Leather Derby Shoes", category: "Shoes", revenue: 7650, orders: 51 },
    { name: "Wool Peacoat", category: "Outerwear", revenue: 6300, orders: 42 },
    { name: "Silk Tie", category: "Accessories", revenue: 4500, orders: 75 }
  ];
}

function generateMockCustomerMetrics(period: string) {
  // Generate customer metrics based on the selected time period
  return {
    newCustomers: 156,
    newCustomersChange: 8.4,
    avgOrderValue: 147.32,
    avgOrderValueChange: 3.2,
    returnRate: 2.8,
    returnRateChange: -0.3,
    repeatPurchase: 34.5,
    repeatPurchaseChange: 5.7
  };
} 