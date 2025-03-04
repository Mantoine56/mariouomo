# API Integration Plan: Connecting the Frontend Dashboard to Backend

## Overview

This document outlines the comprehensive plan for replacing mock data in the analytics dashboard with real data from the NestJS backend API. The plan covers authentication, API client implementation, data fetching strategies, error handling, and performance optimization.

## Current State Analysis

### Frontend (Next.js)
- Currently using mock data hardcoded in the dashboard components (`frontend/app/dashboard/analytics/page.tsx`)
- Export functionality working with mock data (CSV in `frontend/lib/csv-export.ts` and PDF in `frontend/lib/pdf-export.ts`)
- UI components implemented for displaying various analytics metrics
- Period selection implemented but not connected to real data
- Using Supabase for authentication (`frontend/lib/supabase.ts`) but not connecting to NestJS backend

### Backend (NestJS)
- Comprehensive analytics API available at `backend/src/modules/analytics/controllers/analytics.controller.ts` with endpoints:
  - Sales data (`/analytics/sales` with `startDate` and `endDate` parameters)
  - Inventory analytics (`/analytics/inventory` with `date` parameter)
  - Customer insights (`/analytics/customers` with `startDate` and `endDate` parameters)
  - Real-time dashboard data (`/analytics/realtime/dashboard`)
  - Product performance (`/analytics/products/performance` with `startDate` and `endDate` parameters)
  - Category performance (`/analytics/categories/performance` with `startDate` and `endDate` parameters)
  - Traffic sources (`/analytics/traffic-sources`)
- JWT authentication required for all endpoints via `JwtAuthGuard` and `RolesGuard` in `backend/src/modules/auth/guards/`
- All endpoints restricted to Admin role using `@Roles(Role.ADMIN)` decorator
- API responses from `AnalyticsQueryService` and `RealTimeTrackingService` in `backend/src/modules/analytics/services/`

## Implementation Plan

### 1. Authentication Setup

1. **Create Authentication Service** (New file)
   ```typescript
   // New file: frontend/lib/auth-service.ts
   
   import { supabase } from './supabase';
   
   /**
    * Authentication service for managing JWT tokens and user sessions
    */
   export class AuthService {
     // Store JWT token in memory (consider more secure options for production)
     private static token: string | null = null;
   
     /**
      * Get the JWT token for API requests
      */
     static async getToken(): Promise<string | null> {
       // If we already have a token, return it
       if (this.token) return this.token;
   
       // Get session from Supabase
       const { data } = await supabase.auth.getSession();
       const session = data?.session;
   
       if (session?.access_token) {
         this.token = session.access_token;
         return this.token;
       }
   
       return null;
     }
   
     /**
      * Check if user is authenticated
      */
     static async isAuthenticated(): Promise<boolean> {
       const token = await this.getToken();
       return !!token;
     }
   
     /**
      * Clear the stored token (on logout)
      */
     static clearToken() {
       this.token = null;
     }
   }
   ```

2. **Add Authentication Guard for API Routes** (New file or modify existing)
   ```typescript
   // New or modify existing file: frontend/middleware.ts
   
   import { NextRequest, NextResponse } from 'next/server';
   import { AuthService } from './lib/auth-service';
   
   export async function middleware(request: NextRequest) {
     // Only apply to dashboard routes
     if (request.nextUrl.pathname.startsWith('/dashboard')) {
       const isAuthenticated = await AuthService.isAuthenticated();
       
       if (!isAuthenticated) {
         return NextResponse.redirect(new URL('/login', request.url));
       }
     }
     
     return NextResponse.next();
   }
   ```

### 2. API Client Implementation

1. **Create Base API Client** (New file)
   ```typescript
   // New file: frontend/lib/api-client.ts
   
   import { AuthService } from './auth-service';
   
   /**
    * Base API configuration
    */
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
   
   /**
    * API Error class for handling API-specific errors
    */
   export class ApiError extends Error {
     status: number;
     
     constructor(message: string, status: number) {
       super(message);
       this.status = status;
       this.name = 'ApiError';
     }
   }
   
   /**
    * Base API client for making authenticated requests to the backend
    */
   export class ApiClient {
     /**
      * Make a GET request to the API
      * @param endpoint The API endpoint path
      * @param params Optional query parameters
      * @returns The response data
      * @throws ApiError if the request fails
      */
     static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
       // Build URL with query parameters
       const url = new URL(`${API_BASE_URL}${endpoint}`);
       
       if (params) {
         Object.entries(params).forEach(([key, value]) => {
           url.searchParams.append(key, value);
         });
       }
       
       // Get authentication token
       const token = await AuthService.getToken();
       
       if (!token) {
         throw new ApiError('Authentication required', 401);
       }
       
       // Make the request
       const response = await fetch(url.toString(), {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });
       
       // Handle non-successful responses
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new ApiError(
           errorData.message || `API request failed with status ${response.status}`,
           response.status
         );
       }
       
       // Parse and return the response data
       return response.json();
     }
   }
   ```

2. **Create Analytics API Service** (New file)
   ```typescript
   // New file: frontend/lib/analytics-api.ts
   
   import { ApiClient } from './api-client';
   
   /**
    * Service for interacting with the analytics API endpoints defined in
    * backend/src/modules/analytics/controllers/analytics.controller.ts
    */
   export class AnalyticsApi {
     /**
      * Get sales analytics for a specified date range
      * Connects to: GET /analytics/sales in AnalyticsController
      * @param startDate The start date
      * @param endDate The end date
      * @returns Sales analytics data
      */
     static async getSales(startDate: Date, endDate: Date) {
       return ApiClient.get('/analytics/sales', {
         startDate: startDate.toISOString(),
         endDate: endDate.toISOString(),
       });
     }
     
     /**
      * Get inventory analytics for a specific date
      * Connects to: GET /analytics/inventory in AnalyticsController
      * @param date The date for inventory data
      * @returns Inventory analytics data
      */
     static async getInventory(date: Date) {
       return ApiClient.get('/analytics/inventory', {
         date: date.toISOString(),
       });
     }
     
     /**
      * Get customer analytics for a specified date range
      * Connects to: GET /analytics/customers in AnalyticsController
      * @param startDate The start date
      * @param endDate The end date
      * @returns Customer analytics data
      */
     static async getCustomers(startDate: Date, endDate: Date) {
       return ApiClient.get('/analytics/customers', {
         startDate: startDate.toISOString(),
         endDate: endDate.toISOString(),
       });
     }
     
     /**
      * Get real-time dashboard data
      * Connects to: GET /analytics/realtime/dashboard in AnalyticsController
      * @returns Real-time dashboard metrics
      */
     static async getRealTimeDashboard() {
       return ApiClient.get('/analytics/realtime/dashboard');
     }
     
     /**
      * Get product performance metrics for a specified date range
      * Connects to: GET /analytics/products/performance in AnalyticsController
      * @param startDate The start date
      * @param endDate The end date
      * @returns Product performance data
      */
     static async getProductPerformance(startDate: Date, endDate: Date) {
       return ApiClient.get('/analytics/products/performance', {
         startDate: startDate.toISOString(),
         endDate: endDate.toISOString(),
       });
     }
     
     /**
      * Get category performance metrics for a specified date range
      * Connects to: GET /analytics/categories/performance in AnalyticsController
      * @param startDate The start date
      * @param endDate The end date
      * @returns Category performance data
      */
     static async getCategoryPerformance(startDate: Date, endDate: Date) {
       return ApiClient.get('/analytics/categories/performance', {
         startDate: startDate.toISOString(),
         endDate: endDate.toISOString(),
       });
     }
     
     /**
      * Get traffic source distribution
      * Connects to: GET /analytics/traffic-sources in AnalyticsController
      * @returns Traffic source data
      */
     static async getTrafficSources() {
       return ApiClient.get('/analytics/traffic-sources');
     }
   }
   ```

### 3. Period Selection to Date Conversion

1. **Create Date Utility for Period Parsing** (New file)
   ```typescript
   // New file: frontend/lib/date-utils.ts
   
   /**
    * Convert a period selection to a date range
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
   ```

### 4. Implementing Real Data in the Dashboard

1. **Update Analytics Dashboard to Use Real Data** (Modify existing file)

   ```typescript
   // Modify existing file: frontend/app/dashboard/analytics/page.tsx
   
   "use client";
   
   import { useState, useEffect } from "react";
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
   import { Button } from "@/components/ui/button";
   import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
   import { RefreshCw } from "lucide-react";
   import { cn } from "@/lib/utils";
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
   import SalesTrendChart from "@/components/analytics/sales-trend-chart";
   import RevenueCategoryChart from "@/components/analytics/revenue-category-chart";
   import CustomerAcquisitionChart from "@/components/analytics/customer-acquisition-chart";
   import { AnalyticsExport } from "@/components/analytics/analytics-export";
   import { AnalyticsApi } from "@/lib/analytics-api";
   import { getPeriodDates } from "@/lib/date-utils";
   import { AlertCircle } from "lucide-react";
   import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
   
   export default function AnalyticsDashboard() {
     // State for time period selection
     const [timePeriod, setTimePeriod] = useState<string>("7d");
     const [reportType, setReportType] = useState<string>("overview");
     
     // State for loading and error handling
     const [isLoading, setIsLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     
     // State for analytics data
     const [salesData, setSalesData] = useState<any>(null);
     const [inventoryData, setInventoryData] = useState<any>(null);
     const [customerData, setCustomerData] = useState<any>(null);
     const [productData, setProductData] = useState<any>(null);
     const [categoryData, setCategoryData] = useState<any>(null);
     const [realtimeData, setRealtimeData] = useState<any>(null);
     const [trafficData, setTrafficData] = useState<any>(null);
   
     // Function to load data based on the selected period
     const loadData = async () => {
       setIsLoading(true);
       setError(null);
       
       try {
         const { startDate, endDate } = getPeriodDates(timePeriod);
         
         // Fetch all required data in parallel
         const [
           salesResponse,
           inventoryResponse,
           customerResponse,
           productResponse,
           categoryResponse,
           realtimeResponse,
           trafficResponse,
         ] = await Promise.all([
           AnalyticsApi.getSales(startDate, endDate),
           AnalyticsApi.getInventory(endDate), // Current inventory snapshot
           AnalyticsApi.getCustomers(startDate, endDate),
           AnalyticsApi.getProductPerformance(startDate, endDate),
           AnalyticsApi.getCategoryPerformance(startDate, endDate),
           AnalyticsApi.getRealTimeDashboard(),
           AnalyticsApi.getTrafficSources(),
         ]);
         
         // Set state with the fetched data
         setSalesData(salesResponse);
         setInventoryData(inventoryResponse);
         setCustomerData(customerResponse);
         setProductData(productResponse);
         setCategoryData(categoryResponse);
         setRealtimeData(realtimeResponse);
         setTrafficData(trafficResponse);
       } catch (err) {
         console.error('Error fetching analytics data:', err);
         setError('Failed to load analytics data. Please try again later.');
       } finally {
         setIsLoading(false);
       }
     };
     
     // Load data when component mounts or when period changes
     useEffect(() => {
       loadData();
       
       // Optional: Set up polling for real-time data
       const realtimeInterval = setInterval(async () => {
         try {
           const response = await AnalyticsApi.getRealTimeDashboard();
           setRealtimeData(response);
         } catch (err) {
           console.error('Error updating real-time data:', err);
         }
       }, 60000); // Update every minute
       
       // Clean up interval on unmount
       return () => clearInterval(realtimeInterval);
     }, [timePeriod]);
     
     // Format data for display
     const formatData = () => {
       // Implementation depends on actual API response structure
       // This will transform backend data to match format expected by chart components
     };
     
     // Handler for time period change
     const handlePeriodChange = (value: string) => {
       setTimePeriod(value);
       // Data will be reloaded by the useEffect
     };
     
     // Handler for refreshing data
     const handleRefreshData = () => {
       loadData();
     };
     
     // Display loading state
     if (isLoading && !salesData) {
       return (
         <div className="flex justify-center items-center h-96">
           <div className="flex flex-col items-center">
             <RefreshCw className="h-8 w-8 animate-spin text-primary" />
             <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
           </div>
         </div>
       );
     }
     
     // Display error state
     if (error) {
       return (
         <Alert variant="destructive" className="mx-8 my-8">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
           <Button variant="outline" onClick={handleRefreshData} className="mt-4">
             Try Again
           </Button>
         </Alert>
       );
     }
     
     // Render dashboard with data
     return (
       // ... existing dashboard UI, but using real data from state ...
     );
   }
   ```

### 5. Data Transformation Utilities

1. **Create Data Transformation Helper** (New file)
   ```typescript
   // New file: frontend/lib/analytics-transformers.ts
   
   /**
    * Transform backend sales data to format expected by the SalesTrendChart
    * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
    * to frontend/components/analytics/sales-trend-chart.tsx
    */
   export function transformSalesData(backendData: any) {
     // Structure depends on actual API response
     return backendData.map((item: any) => ({
       date: formatDate(new Date(item.date)),
       value: item.revenue,
     }));
   }
   
   /**
    * Transform category data for the RevenueCategoryChart
    * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
    * to frontend/components/analytics/revenue-category-chart.tsx
    */
   export function transformCategoryData(backendData: any) {
     // Structure depends on actual API response
     return backendData.map((item: any, index: number) => ({
       name: item.category,
       value: item.revenue,
       color: getCategoryColor(index),
     }));
   }
   
   /**
    * Transform customer data for the CustomerAcquisitionChart
    * Maps data from backend/src/modules/analytics/services/analytics-query.service.ts 
    * to frontend/components/analytics/customer-acquisition-chart.tsx
    */
   export function transformCustomerData(backendData: any) {
     // Structure depends on actual API response
     return backendData.map((item: any) => ({
       date: formatDate(new Date(item.date)),
       newCustomers: item.new_customers,
       returningCustomers: item.returning_customers,
     }));
   }
   
   /**
    * Get a color for a category based on index
    */
   function getCategoryColor(index: number): string {
     const colors = [
       "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
       "#9966FF", "#FF9F40", "#607D8B", "#4CAF50",
     ];
     
     return colors[index % colors.length];
   }
   
   /**
    * Format a date object to a readable string
    */
   function formatDate(date: Date): string {
     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
   }
   ```

### 6. Error Handling & Loading States

1. **Create Loading Component** (New file)
   ```typescript
   // New file: frontend/components/ui/loading.tsx
   
   import { RefreshCw } from "lucide-react";
   
   interface LoadingProps {
     message?: string;
     size?: 'sm' | 'default' | 'lg';
   }
   
   export function Loading({ 
     message = 'Loading...', 
     size = 'default' 
   }: LoadingProps) {
     const sizeClasses = {
       sm: 'h-4 w-4',
       default: 'h-8 w-8',
       lg: 'h-12 w-12',
     };
     
     return (
       <div className="flex justify-center items-center h-full w-full min-h-[200px]">
         <div className="flex flex-col items-center">
           <RefreshCw className={`animate-spin text-primary ${sizeClasses[size]}`} />
           {message && <p className="mt-4 text-muted-foreground">{message}</p>}
         </div>
       </div>
     );
   }
   ```

2. **Create Error Display Component** (New file)
   ```typescript
   // New file: frontend/components/ui/error-display.tsx
   
   import { AlertCircle } from "lucide-react";
   import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
   import { Button } from "@/components/ui/button";
   
   interface ErrorDisplayProps {
     title?: string;
     message: string;
     onRetry?: () => void;
   }
   
   export function ErrorDisplay({
     title = 'Error',
     message,
     onRetry,
   }: ErrorDisplayProps) {
     return (
       <Alert variant="destructive" className="mx-auto my-4 max-w-3xl">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>{title}</AlertTitle>
         <AlertDescription>{message}</AlertDescription>
         {onRetry && (
           <Button variant="outline" onClick={onRetry} className="mt-4">
             Try Again
           </Button>
         )}
       </Alert>
     );
   }
   ```

### 7. Environment Configuration

1. **Update Environment Variables** (Modify existing file)
   ```
   # Modify existing file: frontend/.env.local
   
   # Add the following variables:
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Create Configuration File** (New file)
   ```typescript
   // New file: frontend/lib/config.ts
   
   export const config = {
     apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
     supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
     
     // Polling intervals (in milliseconds)
     realtimePollingInterval: 60000, // 1 minute
     dashboardRefreshInterval: 300000, // 5 minutes
     
     // Feature flags
     enableRealtimeUpdates: true,
     enableExportFeatures: true,
   };
   ```

## Implementation Timeline

1. **Week 1: Foundation**
   - Create API client and authentication setup
     - `frontend/lib/auth-service.ts`
     - `frontend/middleware.ts`
     - `frontend/lib/api-client.ts`
   - Implement date utilities and transformation helpers
     - `frontend/lib/date-utils.ts`
     - `frontend/lib/analytics-transformers.ts`
   - Set up environment configuration
     - `frontend/.env.local`
     - `frontend/lib/config.ts`
   - Add loading and error components
     - `frontend/components/ui/loading.tsx`
     - `frontend/components/ui/error-display.tsx`

2. **Week 2: Dashboard Integration**
   - Connect overview dashboard to real data
     - Modify `frontend/app/dashboard/analytics/page.tsx`
   - Implement real-time data polling
     - Use `backend/src/modules/analytics/services/real-time-tracking.service.ts` endpoints
   - Test and debug API integration
     - Verify correct API calls to backend endpoints
   - Handle error scenarios and edge cases

3. **Week 3: Export Integration & Optimization**
   - Update export functionality to use real data
     - Modify `frontend/components/analytics/analytics-export.tsx`
     - Modify `frontend/components/analytics/export-button.tsx`
   - Optimize data fetching and caching
     - Implement caching strategies for API responses
   - Add visual feedback for loading states
     - Integrate loading components throughout the dashboard
   - Implement comprehensive error handling
     - Integrate error display components throughout the dashboard

## Testing Plan

1. **Unit Tests**
   - Test date utility functions (`frontend/lib/date-utils.ts`)
   - Test data transformation functions (`frontend/lib/analytics-transformers.ts`)
   - Test API client error handling (`frontend/lib/api-client.ts`)

2. **Integration Tests**
   - Test API service with mock responses (`frontend/lib/analytics-api.ts`)
   - Test dashboard data loading (`frontend/app/dashboard/analytics/page.tsx`)
   - Test period selection changes and corresponding API calls

3. **E2E Tests**
   - Test full dashboard loading and interaction
   - Test export functionality with real data
   - Test real-time updates and polling

## Monitoring & Performance

1. **Performance Metrics to Track**
   - API response times (from `backend/src/modules/analytics/*` endpoints)
   - Time to first meaningful paint
   - Dashboard rendering time
   - Memory usage

2. **Implementation**
   - Add performance tracking for API calls
   - Implement error logging
   - Monitor dashboard rendering performance
   - Track user interactions with analytics

## Conclusion

This implementation plan provides a comprehensive approach to connecting the frontend analytics dashboard to the backend API. By following this plan, we will replace mock data with real-time, authenticated API data while ensuring a smooth user experience with proper loading states and error handling.

The key benefits of this implementation include:
- Real-time data visualization from the backend's analytics services
- Secure, authenticated API communication between Next.js frontend and NestJS backend
- Responsive UI with appropriate loading states
- Comprehensive error handling
- Optimized data fetching and caching
- Scalable architecture for future extensions 