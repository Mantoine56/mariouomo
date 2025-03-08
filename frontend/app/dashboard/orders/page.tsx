'use client';

/**
 * Simplified Orders Page
 * 
 * This is a minimal implementation to debug the infinite redirect issue
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// Import API client
import { ApiClient } from '@/lib/api-client';
import { config } from '@/lib/config';

/**
 * Simplified Orders page for debugging
 */
export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const { toast } = useToast();
  const router = useRouter();

  // Disable all automatic loading and redirects to debug the issue
  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log("Manually checking backend availability...");
        const isAvailable = await ApiClient.isBackendAvailable();
        console.log("Backend available:", isAvailable);
        setBackendAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking backend:", error);
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []); // Empty dependency array - only run once

  // Simple manual load function
  const handleManualLoad = async () => {
    try {
      setIsLoading(true);
      console.log("Manually attempting to load orders...");
      
      // Simple fetch to test API connectivity
      const response = await fetch(`${config.api.baseUrl}/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        console.log("Health check successful");
        setOrderCount(5); // Dummy count for testing
        toast({
          title: "Success",
          description: "Connected to backend successfully!",
          variant: "default",
        });
      } else {
        console.error("Health check failed:", response.status);
        toast({
          title: "Error",
          description: `Backend responded with status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in manual load:", error);
      toast({
        title: "Error",
        description: "Failed to connect to backend server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <Heading
          title="Orders (Debug Mode)"
          description="Debugging the orders page"
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
          </ul>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            onClick={handleManualLoad} 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Test Backend Connection"}
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 