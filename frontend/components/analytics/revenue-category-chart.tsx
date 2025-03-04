"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RevenueCategoryChart Component
 * 
 * Displays a visualization of revenue distribution by product category.
 * Note: This is a placeholder component that simulates a donut chart visualization.
 * In a production environment, this would be replaced with a proper chart 
 * using a library like Recharts or Chart.js.
 */
interface RevenueCategoryChartProps {
  title?: string;
  description?: string;
  data?: {
    category: string;
    revenue: number;
    color?: string;
  }[];
  period?: string;
  isLoading?: boolean;
  chartType?: "donut" | "bar";
}

export default function RevenueCategoryChart({
  title = "Revenue by Category",
  description = "Top performing categories",
  data = [],
  period = "7d",
  isLoading = false,
  chartType = "donut"
}: RevenueCategoryChartProps) {
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Generate mock category data if none is provided
  const categoryData = data.length > 0 
    ? data 
    : generateMockCategoryData();
  
  // Calculate total revenue
  const totalRevenue = categoryData.reduce((sum, item) => sum + item.revenue, 0);
  
  // Calculate percentages
  const dataWithPercentages = categoryData.map(item => ({
    ...item,
    percentage: (item.revenue / totalRevenue) * 100
  }));
  
  // Sort by revenue (highest first)
  const sortedData = [...dataWithPercentages].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <div className="animate-pulse text-center">
              {chartType === "donut" 
                ? <PieChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                : <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              }
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart visualization */}
            {chartType === "donut" ? (
              <div className="relative h-[220px] w-[220px] mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
                
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <g transform="translate(110, 110)">
                    {/* Create donut segments */}
                    {createDonutSegments(sortedData)}
                  </g>
                </svg>
              </div>
            ) : (
              <div className="h-[220px] relative">
                <div className="absolute left-0 top-0 h-full border-r border-border flex flex-col justify-between py-2 pr-2">
                  <span className="text-xs text-muted-foreground">$30k</span>
                  <span className="text-xs text-muted-foreground">$0</span>
                </div>
                
                <div className="ml-10 h-full pt-2">
                  <div className="grid grid-cols-5 h-full gap-4">
                    {sortedData.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex flex-col justify-end h-full">
                        <div 
                          className="w-full rounded-t-sm" 
                          style={{ 
                            height: `${Math.max(5, (item.revenue / 30000) * 100)}%`,
                            backgroundColor: item.color || getCategoryColor(item.category)
                          }}
                        ></div>
                        <span className="text-xs text-muted-foreground mt-2 truncate text-center">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="space-y-2">
              {sortedData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color || getCategoryColor(item.category) }}
                    ></div>
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Create SVG paths for donut chart segments
 */
function createDonutSegments(data: any[]) {
  const segments: JSX.Element[] = [];
  let startAngle = 0;
  
  data.forEach((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    // Calculate SVG arc path
    const x1 = 80 * Math.cos(degreesToRadians(startAngle));
    const y1 = 80 * Math.sin(degreesToRadians(startAngle));
    const x2 = 80 * Math.cos(degreesToRadians(endAngle));
    const y2 = 80 * Math.sin(degreesToRadians(endAngle));
    
    // Determine if the arc should be drawn as the major arc (> 180 degrees)
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Create SVG path for the donut segment
    const pathData = [
      `M ${60 * Math.cos(degreesToRadians(startAngle))},${60 * Math.sin(degreesToRadians(startAngle))}`,
      `L ${x1},${y1}`,
      `A 80,80 0 ${largeArcFlag},1 ${x2},${y2}`,
      `L ${60 * Math.cos(degreesToRadians(endAngle))},${60 * Math.sin(degreesToRadians(endAngle))}`,
      `A 60,60 0 ${largeArcFlag},0 ${60 * Math.cos(degreesToRadians(startAngle))},${60 * Math.sin(degreesToRadians(startAngle))}`,
      'Z'
    ].join(' ');
    
    segments.push(
      <path 
        key={index} 
        d={pathData} 
        fill={item.color || getCategoryColor(item.category)}
      />
    );
    
    startAngle = endAngle;
  });
  
  return segments;
}

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return (degrees - 90) * (Math.PI / 180);
}

/**
 * Get a color for a category
 */
function getCategoryColor(category: string): string {
  const colors = [
    "#0ea5e9", // sky-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#6366f1", // indigo-500
    "#f43f5e", // rose-500
    "#84cc16", // lime-500
    "#06b6d4", // cyan-500
    "#14b8a6", // teal-500
  ];
  
  // Simple hash function to generate a consistent color for a category
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate mock category data
 */
function generateMockCategoryData() {
  return [
    { category: "Shirts", revenue: 24500 },
    { category: "Pants", revenue: 18300 },
    { category: "Shoes", revenue: 12800 },
    { category: "Accessories", revenue: 8700 },
    { category: "Outerwear", revenue: 15200 },
  ];
} 