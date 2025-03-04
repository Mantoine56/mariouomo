'use client';

/**
 * Orders management page
 * 
 * Displays all orders with filtering, sorting and detailed views
 */

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { useToast } from '@/components/ui/use-toast';
import { Order, fetchOrders } from '@/lib/mock-api';
import { useRouter } from 'next/navigation';

/**
 * Orders page component with data fetching and interaction handling
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Load orders from API on component mount
   */
  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Fetch order data from API
   */
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for order status changes
   */
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // In a real app, this would call an API endpoint
      toast({
        title: 'Status Updated',
        description: `Order ${orderId} status changed to ${newStatus}`,
        variant: 'success',
      });
      
      // Refresh orders list
      await loadOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Heading title="Orders" description="Manage customer orders" />
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadOrders} 
              variant="outline" 
              size="icon"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => router.push('/dashboard/orders/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create order
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Data Table */}
        <DataTable columns={columns} data={orders} />
      </div>
    </div>
  );
} 