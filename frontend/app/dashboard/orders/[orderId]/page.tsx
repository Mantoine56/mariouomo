'use client';

/**
 * Order Details Page
 * 
 * Displays detailed information about a specific order
 * including customer details, items, payment information, and shipping status
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  CreditCard,
  Calendar, 
  User, 
  Home, 
  CheckCircle, 
  AlertTriangle,
  Edit, 
  Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/lib/mock-api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { OrderStatusTimeline } from '@/components/orders/order-status-timeline';
import { OrderFulfillment } from '@/components/orders/order-fulfillment';
import { OrderStatusManagement } from '@/components/orders/order-status-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper functions
const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'processing':
    case 'confirmed':
      return 'default';
    case 'shipped':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    default:
      return 'default';
  }
};

const getPaymentStatusVariant = (status: Order['payment_status']) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'refunded':
      return 'default';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Order Details Page Component
 */
export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch order details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate API loading delay without making an actual fetch request
        // that would cause 404 errors
        setTimeout(() => {
          // Mock data - in real app this would come from API
          const mockOrder: Order = {
            id: params.orderId as string,
            customer: {
              id: "cust123",
              name: "John Doe",
              email: "john.doe@example.com",
              phone: "+1 (555) 123-4567"
            },
            status: "processing",
            total_amount: 289.97,
            subtotal: 249.97,
            tax: 20.00,
            shipping: 20.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payment_status: "paid",
            shipping_address: {
              street: "123 Main Street",
              city: "New York",
              state: "NY",
              country: "USA",
              postal_code: "10001"
            },
            billing_address: {
              street: "123 Main Street",
              city: "New York",
              state: "NY",
              country: "USA",
              postal_code: "10001"
            },
            items: [
              {
                id: "item1",
                product_id: "prod1",
                product_name: "Designer T-Shirt",
                product_image: "/images/tshirt.jpg",
                quantity: 1,
                unit_price: 149.99,
                total_price: 149.99
              },
              {
                id: "item2",
                product_id: "prod2",
                product_name: "Slim Fit Jeans",
                product_image: "/images/jeans.jpg",
                quantity: 1,
                unit_price: 99.98,
                total_price: 99.98
              }
            ],
            customer_notes: "Please leave package at the door",
            payment_method: "Credit Card",
            tracking_number: "TRK928172637"
          };
          
          setOrder(mockOrder);
          setIsLoading(false);
        }, 800); // Simulate network delay
        
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  // Remove toast from dependencies to prevent re-renders
  }, [params.orderId]);

  // Handle order status update
  const handleStatusUpdate = (newStatus: Order['status'], note?: string) => {
    if (!order) return;
    
    // In a real app, this would be an API call with the note
    toast({
      title: "Status Updated",
      description: `Order status changed to ${formatStatus(newStatus)}`,
      variant: "success"
    });
    
    // Update local state
    setOrder({
      ...order,
      status: newStatus,
      updated_at: new Date().toISOString()
    });
  };

  // Handle tracking update
  const handleTrackingUpdate = (trackingNumber: string, carrier: string) => {
    if (!order) return;
    
    // In a real app, this would be an API call
    toast({
      title: "Tracking Updated",
      description: `Tracking information updated for order #${order.id}`,
      variant: "success"
    });
    
    // Update local state
    setOrder({
      ...order,
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString()
    });
  };

  // Handle sending notification to customer
  const handleSendNotification = () => {
    toast({
      title: "Notification Sent",
      description: `Notification sent to ${order?.customer.email}`,
      variant: "success"
    });
  };

  if (isLoading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground">The requested order does not exist or has been deleted.</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/orders')}>
                Return to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Button>
            <div className="flex items-center gap-2">
              <Heading title={`Order #${order.id}`} description={`Created ${formatDate(order.created_at)}`} />
              <Badge variant={getStatusVariant(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSendNotification}
            >
              <Send className="mr-2 h-4 w-4" />
              Notify Customer
            </Button>
            <Button
              onClick={() => handleStatusUpdate(
                order.status === 'processing' ? 'shipped' : 
                order.status === 'shipped' ? 'delivered' : 'processing'
              )}
            >
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Order Processing and Summary Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="summary">Order Summary</TabsTrigger>
            <TabsTrigger value="processing">Processing & Fulfillment</TabsTrigger>
          </TabsList>
          
          {/* Order Summary Tab */}
          <TabsContent value="summary" className="space-y-6 pt-4">
            {/* Order Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer and Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="mr-2 h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{order.customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    {order.customer.phone && (
                      <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                  
                  {order.customer_notes && (
                    <div>
                      <h3 className="font-medium mb-1">Customer Notes</h3>
                      <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Package className="mr-2 h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <div className="flex items-center">
                      <CreditCard className="mr-1 h-4 w-4" />
                      <span>{order.payment_method}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                      {formatStatus(order.payment_status)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking Number</span>
                    <span className="font-mono">{order.tracking_number || 'N/A'}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Items
                </CardTitle>
                <CardDescription>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center p-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                        {item.product_image ? (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name} 
                            className="max-h-14 max-w-14 object-contain"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/dashboard/products/${item.product_id}`} className="font-medium hover:underline">
                          {item.product_name}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Processing & Fulfillment Tab */}
          <TabsContent value="processing" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusTimeline 
                    status={order.status}
                    createdAt={order.created_at}
                    updatedAt={order.updated_at}
                    paymentStatus={order.payment_status}
                  />
                </CardContent>
              </Card>
              
              {/* Order Fulfillment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Order Fulfillment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderFulfillment 
                    order={order}
                    onTrackingUpdate={handleTrackingUpdate}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </CardContent>
              </Card>
              
              {/* Order Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2 h-5 w-5" />
                    Status Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusManagement
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 