"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Users, UserPlus, RefreshCcw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * CustomerAcquisitionChart Component
 * 
 * Displays a visualization of customer acquisition and retention metrics.
 * This component provides insights into new vs. returning customers and 
 * overall customer growth over time.
 */
interface CustomerAcquisitionChartProps {
  title?: string;
  description?: string;
  period: string;
  isLoading?: boolean;
  data?: {
    newCustomers: number;
    returningCustomers: number;
    date: string;
  }[];
}

export default function CustomerAcquisitionChart({
  title = "Customer Acquisition",
  description = "New vs. returning customers",
  period = "7d",
  isLoading = false,
  data = []
}: CustomerAcquisitionChartProps) {
  
  // Generate mock data if none is provided
  const chartData = data.length > 0 ? data : generateMockCustomerData(period);
  
  // Calculate totals and metrics
  const totalNewCustomers = chartData.reduce((sum, item) => sum + item.newCustomers, 0);
  const totalReturningCustomers = chartData.reduce((sum, item) => sum + item.returningCustomers, 0);
  const totalCustomers = totalNewCustomers + totalReturningCustomers;
  
  // Calculate percentages
  const newCustomerPercentage = (totalNewCustomers / totalCustomers) * 100;
  const returningCustomerPercentage = (totalReturningCustomers / totalCustomers) * 100;
  
  // Maximum value for chart scaling
  const maxValue = Math.max(
    ...chartData.map(item => Math.max(item.newCustomers, item.returningCustomers))
  );
  
  // Format number with comma separator
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full p-1.5 hover:bg-muted cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-xs text-sm">
                  New customers are those who made their first purchase in this period.
                  Returning customers have purchased before.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <div className="animate-pulse text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading customer data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/20 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(totalCustomers)}</p>
              </div>
              <div className="bg-muted/20 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">New</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(totalNewCustomers)}</p>
                <p className="text-xs text-muted-foreground">{newCustomerPercentage.toFixed(1)}% of total</p>
              </div>
              <div className="bg-muted/20 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Returning</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(totalReturningCustomers)}</p>
                <p className="text-xs text-muted-foreground">{returningCustomerPercentage.toFixed(1)}% of total</p>
              </div>
            </div>
            
            {/* Chart visualization */}
            <div className="h-[220px] relative">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 h-full border-r border-border flex flex-col justify-between py-2 pr-2">
                <span className="text-xs text-muted-foreground">{maxValue}</span>
                <span className="text-xs text-muted-foreground">0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-10 h-full pt-2">
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}>
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col justify-end h-full px-1">
                      {/* New customers bar */}
                      <div className="relative mb-1">
                        <div 
                          className="w-full bg-blue-500 rounded-t-sm" 
                          style={{ 
                            height: `${Math.max(4, (item.newCustomers / maxValue) * 100)}%`,
                          }}
                        ></div>
                        <div className="absolute bottom-0 inset-x-0 bg-blue-500/20 h-0.5 w-full"></div>
                      </div>
                      
                      {/* Returning customers bar */}
                      <div>
                        <div 
                          className="w-full bg-green-500 rounded-t-sm" 
                          style={{ 
                            height: `${Math.max(4, (item.returningCustomers / maxValue) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      
                      {/* X-axis label */}
                      <span className="text-xs text-muted-foreground mt-2 text-center">
                        {formatDateLabel(item.date, period)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="text-sm">New Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-sm">Returning Customers</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Format date label based on period
 */
function formatDateLabel(date: string, period: string): string {
  // This would normally parse the actual date
  // For the mock data we'll just return the date string directly
  switch (period) {
    case "today":
    case "yesterday":
      return date; // e.g. "8am"
    case "7d":
      return date; // e.g. "Mon"
    case "30d":
      return date; // e.g. "Week 2"
    case "90d":
    case "ytd":
      return date; // e.g. "Mar"
    case "all":
      return date; // e.g. "2023"
    default:
      return date;
  }
}

/**
 * Generate mock customer data based on period
 */
function generateMockCustomerData(period: string): { newCustomers: number; returningCustomers: number; date: string }[] {
  let mockData: { newCustomers: number; returningCustomers: number; date: string }[] = [];
  
  switch (period) {
    case "today":
    case "yesterday":
      mockData = [
        { date: "9am", newCustomers: 12, returningCustomers: 23 },
        { date: "12pm", newCustomers: 18, returningCustomers: 45 },
        { date: "3pm", newCustomers: 15, returningCustomers: 52 },
        { date: "6pm", newCustomers: 22, returningCustomers: 64 },
        { date: "9pm", newCustomers: 9, returningCustomers: 31 },
      ];
      break;
      
    case "7d":
      mockData = [
        { date: "Mon", newCustomers: 48, returningCustomers: 92 },
        { date: "Tue", newCustomers: 52, returningCustomers: 87 },
        { date: "Wed", newCustomers: 43, returningCustomers: 103 },
        { date: "Thu", newCustomers: 38, returningCustomers: 95 },
        { date: "Fri", newCustomers: 62, returningCustomers: 118 },
        { date: "Sat", newCustomers: 75, returningCustomers: 142 },
        { date: "Sun", newCustomers: 45, returningCustomers: 94 },
      ];
      break;
      
    case "30d":
      mockData = [
        { date: "Week 1", newCustomers: 145, returningCustomers: 283 },
        { date: "Week 2", newCustomers: 164, returningCustomers: 312 },
        { date: "Week 3", newCustomers: 138, returningCustomers: 276 },
        { date: "Week 4", newCustomers: 182, returningCustomers: 345 },
      ];
      break;
      
    case "90d":
      mockData = [
        { date: "Jan", newCustomers: 425, returningCustomers: 864 },
        { date: "Feb", newCustomers: 398, returningCustomers: 923 },
        { date: "Mar", newCustomers: 482, returningCustomers: 1048 },
      ];
      break;
      
    case "ytd":
      mockData = [
        { date: "Jan", newCustomers: 425, returningCustomers: 864 },
        { date: "Feb", newCustomers: 398, returningCustomers: 923 },
        { date: "Mar", newCustomers: 482, returningCustomers: 1048 },
        { date: "Apr", newCustomers: 512, returningCustomers: 1126 },
        { date: "May", newCustomers: 438, returningCustomers: 982 },
        { date: "Jun", newCustomers: 523, returningCustomers: 1245 },
        { date: "Jul", newCustomers: 568, returningCustomers: 1362 },
        { date: "Aug", newCustomers: 492, returningCustomers: 1184 },
        { date: "Sep", newCustomers: 430, returningCustomers: 987 },
      ];
      break;
      
    case "all":
      mockData = [
        { date: "2020", newCustomers: 2450, returningCustomers: 1280 },
        { date: "2021", newCustomers: 3240, returningCustomers: 4520 },
        { date: "2022", newCustomers: 4120, returningCustomers: 8640 },
        { date: "2023", newCustomers: 5280, returningCustomers: 12480 },
        { date: "2024", newCustomers: 3640, returningCustomers: 8950 },
      ];
      break;
      
    default:
      mockData = [
        { date: "Mon", newCustomers: 48, returningCustomers: 92 },
        { date: "Tue", newCustomers: 52, returningCustomers: 87 },
        { date: "Wed", newCustomers: 43, returningCustomers: 103 },
        { date: "Thu", newCustomers: 38, returningCustomers: 95 },
        { date: "Fri", newCustomers: 62, returningCustomers: 118 },
        { date: "Sat", newCustomers: 75, returningCustomers: 142 },
        { date: "Sun", newCustomers: 45, returningCustomers: 94 },
      ];
  }
  
  return mockData;
} 