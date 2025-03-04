"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { LineChart, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SalesTrendChart Component
 * 
 * Displays a visualization of sales trends over time.
 * Note: This is a placeholder component that simulates a chart visualization.
 * In a production environment, this would be replaced with a proper chart 
 * using a library like Recharts or Chart.js.
 */
interface SalesTrendChartProps {
  title?: string;
  description?: string;
  data?: {
    date: string;
    value: number;
  }[];
  period: string;
  isLoading?: boolean;
  trend?: "up" | "down" | "neutral";
  percentageChange?: number;
  comparison?: string;
}

export default function SalesTrendChart({
  title = "Sales Trend",
  description = "Sales performance over time",
  data = [],
  period = "7d",
  isLoading = false,
  trend = "up",
  percentageChange = 12.5,
  comparison = "vs. previous period"
}: SalesTrendChartProps) {
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate mock trend data
  const mockTrendData = generateMockTrendData(period, trend);
  
  // Default period explanations
  const periodExplanations = {
    "today": "Today",
    "yesterday": "Yesterday",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last quarter",
    "ytd": "Year to date",
    "all": "All time"
  };
  
  // Get trend icon based on direction
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-yellow-600" />;
    }
  };
  
  // Get trend class based on direction
  const getTrendClass = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            "flex items-center gap-1",
            getTrendClass()
          )}>
            {getTrendIcon()}
            <span>{trend === "up" ? "+" : trend === "down" ? "-" : ""}{Math.abs(percentageChange).toFixed(1)}%</span>
          </div>
          <span className="text-muted-foreground">{comparison}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <div className="animate-pulse text-center">
              <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Period info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-lg font-medium">{periodExplanations[period as keyof typeof periodExplanations] || period}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-lg font-medium">{formatCurrency(mockTrendData.totalSales)}</p>
              </div>
            </div>
            
            {/* Simulated chart */}
            <div className="h-[280px] relative">
              {/* Chart axis */}
              <div className="absolute left-0 top-0 h-full border-r border-border flex flex-col justify-between py-2 pr-2">
                <span className="text-xs text-muted-foreground">{formatCurrency(mockTrendData.maxValue)}</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(mockTrendData.minValue)}</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-12 h-full flex flex-col justify-end">
                <div className="w-full h-full relative">
                  {/* Horizontal grid lines */}
                  <div className="absolute w-full h-full flex flex-col justify-between">
                    <div className="w-full border-t border-muted/30"></div>
                    <div className="w-full border-t border-muted/30"></div>
                    <div className="w-full border-t border-muted/30"></div>
                    <div className="w-full border-t border-muted/30"></div>
                    <div className="w-full border-t border-muted/30"></div>
                  </div>
                  
                  {/* Chart "points" simulation */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 w-full",
                    mockTrendData.trendClass,
                    trend === "up" ? "h-[60%]" : trend === "down" ? "h-[40%]" : "h-[50%]"
                  )}>
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d={mockTrendData.pathData}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      {/* Area below the line */}
                      <path
                        d={mockTrendData.areaData}
                        fill="currentColor"
                        fillOpacity="0.1"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2">
                  {mockTrendData.labels.map((label, index) => (
                    <span key={index} className="text-xs text-muted-foreground">{label}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Additional stats */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                <p className="font-medium">{formatCurrency(mockTrendData.avgOrderValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="font-medium">{mockTrendData.orders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="font-medium">{mockTrendData.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Generate mock trend data based on period and trend direction
 */
function generateMockTrendData(period: string, trend: "up" | "down" | "neutral") {
  // Generate different labels based on the period
  let labels: string[] = [];
  switch (period) {
    case "today":
    case "yesterday":
      labels = ["12am", "4am", "8am", "12pm", "4pm", "8pm"];
      break;
    case "7d":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      break;
    case "30d":
      labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      break;
    case "90d":
      labels = ["Jan", "Feb", "Mar"];
      break;
    case "ytd":
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
      break;
    case "all":
      labels = ["2020", "2021", "2022", "2023", "2024"];
      break;
    default:
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }
  
  // Generate different paths based on trend
  let pathData = "";
  let areaData = "";
  let trendClass = "";
  let minValue = 5000;
  let maxValue = 15000;
  let totalSales = 0;
  let avgOrderValue = 0;
  let orders = 0;
  let conversionRate = 0;
  
  switch (trend) {
    case "up":
      // Path that generally moves upward
      pathData = "M0,80 C20,70 40,60 60,40 S80,30 100,20";
      areaData = "M0,80 C20,70 40,60 60,40 S80,30 100,20 L100,100 L0,100 Z";
      trendClass = "text-green-600";
      totalSales = 145250;
      avgOrderValue = 125.40;
      orders = 1158;
      conversionRate = 3.7;
      break;
    case "down":
      // Path that generally moves downward
      pathData = "M0,20 C20,30 40,40 60,60 S80,70 100,80";
      areaData = "M0,20 C20,30 40,40 60,60 S80,70 100,80 L100,100 L0,100 Z";
      trendClass = "text-red-600";
      totalSales = 89750;
      avgOrderValue = 102.80;
      orders = 873;
      conversionRate = 2.4;
      break;
    default:
      // Path that stays relatively flat
      pathData = "M0,50 C20,48 40,52 60,48 S80,52 100,50";
      areaData = "M0,50 C20,48 40,52 60,48 S80,52 100,50 L100,100 L0,100 Z";
      trendClass = "text-yellow-600";
      totalSales = 112500;
      avgOrderValue = 115.20;
      orders = 976;
      conversionRate = 3.1;
  }
  
  return {
    labels,
    pathData,
    areaData,
    trendClass,
    minValue,
    maxValue,
    totalSales,
    avgOrderValue,
    orders,
    conversionRate
  };
} 