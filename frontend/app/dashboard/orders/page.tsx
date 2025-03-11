'use client';

/**
 * Orders Page with Real Data
 * 
 * This page fetches and displays actual order data from the backend
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';
import { OrderApi, OrderStatus, Order } from '@/lib/order-api';
import { supabase } from '@/lib/supabase';

// Import API client
import { ApiClient } from '@/lib/api-client';

/**
 * Orders page that fetches real data
 */
export default function OrdersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const orderApi = new OrderApi();
  const [error, setError] = useState<string | null>(null);

  // Check authentication and backend status on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Initializing Orders page...");
        
        // First check backend availability
        const isBackendAvailable = await checkBackend();
        console.log("Backend check completed:", isBackendAvailable);
        
        // Then check authentication status
        const isUserAuthenticated = await checkAuthStatus();
        console.log("Authentication check completed:", isUserAuthenticated);
        
        console.log("Initialization complete:", {
          backend: isBackendAvailable,
          authenticated: isUserAuthenticated
        });
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };
    
    initializeData();
  }, []);

  /**
   * Check authentication status with Supabase
   */
  const checkAuthStatus = async () => {
    try {
      console.log("Checking authentication status...");
      
      // Use the imported supabase instance to ensure consistent session handling
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsAuthenticated(false);
        return false;
      }
      
      const isLoggedIn = !!data.session;
      setIsAuthenticated(isLoggedIn);
      
      console.log("Authentication status:", isLoggedIn ? "Logged in" : "Not logged in");
      
      if (isLoggedIn) {
        // If logged in, log some debug info about the token
        console.log("Session exists:", {
          hasAccessToken: !!data.session?.access_token,
          tokenLength: data.session?.access_token?.length,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'Unknown',
        });
        
        return true;
      } else {
        // Only show the login toast if we're not in the process of loading the page
        // This prevents duplicate toasts
        if (!isLoading) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view orders",
            variant: "destructive",
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      return false;
    }
  };

  // When backend availability changes, log and potentially load orders
  useEffect(() => {
    if (backendAvailable === null) {
      console.log("Backend availability initial state (null), skipping order load");
      return;
    }
    
    console.log("Backend availability changed to:", backendAvailable);
    
    // Only proceed if backendAvailable is true (not false or null)
    if (backendAvailable === true && !isLoading) {
      console.log("Backend is available and not loading, attempting to load orders");
      loadOrders();
    }
  }, [backendAvailable]);

  // Check backend availability
  const checkBackend = async () => {
    try {
      console.log("Checking backend availability...");
      const isAvailable = await ApiClient.isBackendAvailable();
      console.log("Backend availability check result:", isAvailable);
      
      // Update state
      setBackendAvailable(isAvailable);
      
      if (!isAvailable) {
        toast({
          title: "Backend Unavailable",
          description: "Cannot fetch orders because the backend service is not responding.",
          variant: "destructive",
        });
      }
      
      return isAvailable;
    } catch (error) {
      console.error("Error checking backend:", error);
      setBackendAvailable(false);
      
      toast({
        title: "Backend Check Failed",
        description: "Could not determine if the backend service is available.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  /**
   * Fetch orders directly from the debug endpoint
   * This is only used in development mode when we're testing without authentication
   */
  const fetchOrdersDebug = async () => {
    setIsLoading(true);
    try {
      console.log("Making direct request to debug orders endpoint...");
      
      // Get debug key from environment variable or use a fallback
      const debugKey = process.env.NEXT_PUBLIC_DEBUG_KEY || "DEBUG_ONLY";
      
      // Calculate pagination parameters
      const currentPage = page || 1;
      const itemsPerPage = 10; // Default page size
      const skip = (currentPage - 1) * itemsPerPage;
      
      // Build URL with query parameters
      const url = `${config.api.baseUrl}/dev/debug-orders?skip=${skip}&take=${itemsPerPage}&debugKey=${debugKey}`;
      console.log(`Debug URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching debug orders:", response.status, errorText);
        toast({
          title: "Error fetching orders",
          description: `Failed to fetch orders: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return 0;
      }
      
      const data = await response.json();
      console.log("Debug orders response:", data);
      
      // Only update state if we have valid data
      if (data && data.items) {
        setOrders(data.items);
        setOrderCount(data.total);
      } else {
        console.error("Invalid data format received from debug endpoint:", data);
        setOrders([]);
        setOrderCount(0);
      }
      
      setIsLoading(false);
      return data?.total || 0;
    } catch (error: unknown) {
      console.error("Error fetching debug orders:", error);
      toast({
        title: "Error fetching orders",
        description: `Failed to fetch orders: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setIsLoading(false);
      return 0;
    }
  };

  /**
   * Load orders with proper authentication or fallback to debug method
   */
  const loadOrders = async () => {
    console.log("loadOrders called with state:", {
      backendAvailable,
      isAuthenticated,
      isLoading
    });

    // Double-check backend is available before proceeding
    if (backendAvailable !== true) {
      console.error("Backend is not available when attempting to load orders");
      toast({
        title: "Backend Unavailable",
        description: "Cannot fetch orders because the backend service is not responding.",
        variant: "destructive",
      });
      return;
    }
    
    // Don't attempt to load orders if we're already loading
    if (isLoading) {
      console.log("Already loading orders, skipping duplicate load");
      return;
    }
    
    console.log("Loading orders with authentication status:", isAuthenticated);
    setIsLoading(true);
    
    try {
      // First try to use authenticated API if the user is logged in
      if (isAuthenticated) {
        console.log("User is authenticated, using OrderApi");
        
        // Use the OrderApi service which includes authentication
        const orderApi = new OrderApi();
        
        // Log the token for debugging purposes
        const token = await supabase.auth.getSession();
        console.log("Session token available:", !!token.data.session?.access_token);
        
        const response = await orderApi.searchOrders({
          page: page,
          limit: 10,
          sortBy: "created_at",
          sortOrder: "DESC"
        });
        
        console.log("Orders fetched with authentication:", response);
        setOrders(response.items);
        setOrderCount(response.total);
        
        setIsLoading(false);
        return;
      }
      
      // If not authenticated, check if in development mode to use debug endpoint
      if (process.env.NODE_ENV === 'development') {
        console.log("Not authenticated, falling back to debug endpoint in development mode");
        await fetchOrdersDebug();
        return;
      }
      
      // If not in development and not authenticated, prompt user to log in
      console.log("Not authenticated and not in development mode");
      toast({
        title: "Authentication Required",
        description: "Please log in to view orders",
        variant: "destructive",
      });
      
      setIsLoading(false);
    } catch (error: unknown) {
      console.error("Error loading orders:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("Error details:", errorMessage);
      
      toast({
        title: "Error loading orders",
        description: `Failed to load orders: ${errorMessage}`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load orders on initial load and when pagination changes
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Handle manual load button click
  const handleManualLoad = () => {
    loadOrders();
  };

  // Test database connection directly - for development only
  const testDatabaseConnection = async () => {
    try {
      console.log("Testing direct database connection...");
      
      const response = await fetch(`${config.api.baseUrl}/dev/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debugKey: "DEBUG_ONLY"
        })
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      const data = await response.json();
      console.log("Database connection test result:", data);
      
      toast({
        title: data.connected ? "Success" : "Error",
        description: data.message,
        variant: data.connected ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error testing database connection:", error);
      toast({
        title: "Error",
        description: "Failed to test database connection",
        variant: "destructive",
      });
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  /**
   * Handle login with Supabase
   */
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/orders`,
        },
      });
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <Heading
          title="Orders (Debug Mode)"
          description="Debugging the orders page with real data"
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <p className="text-lg font-semibold">Debug Information:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Backend Available: {backendAvailable === null ? 'Checking...' : backendAvailable ? 'Yes' : 'No'}</li>
            <li>Loading State: {isLoading ? 'Loading' : 'Idle'}</li>
            <li>Order Count: {orderCount}</li>
            <li>Backend URL: {config.api.baseUrl}</li>
            <li>Authentication Status: {isAuthenticated ? 'Logged In' : 'Not Authenticated'}</li>
          </ul>
        </div>
        
        <div className="flex space-x-4">
          {!isAuthenticated && (
            <Button onClick={handleLogin} variant="default">
              Login to Access Orders
            </Button>
          )}
          
          {/* Development helper buttons - should be removed in production */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Button 
                onClick={testDatabaseConnection} 
                disabled={isLoading}
                variant="outline"
              >
                Test DB Connection
              </Button>
              
              <Button 
                onClick={handleManualLoad} 
                disabled={isLoading}
                variant="outline"
              >
                Test API Connection
              </Button>
            </>
          )}
          
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Display recent orders if available */}
        {orders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Orders (Most Recent {orders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-muted">
                      <td className="p-2">{order.id.substring(0, 8)}...</td>
                      <td className="p-2">
                        <Badge variant={
                          order.status === OrderStatus.PROCESSING ? 'warning' :
                          order.status === OrderStatus.CANCELLED ? 'destructive' : 
                          order.status === OrderStatus.REFUNDED ? 'secondary' :
                          order.status === OrderStatus.DELIVERED ? 'default' :
                          'outline'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-2">{formatDate(order.created_at)}</td>
                      <td className="p-2 text-right">{formatCurrency(typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/15 p-3 rounded-md mb-4 text-destructive">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 