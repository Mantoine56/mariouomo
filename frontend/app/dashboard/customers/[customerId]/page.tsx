'use client';

/**
 * Customer Detail Page
 * 
 * Displays comprehensive customer information including profile details,
 * order history, purchase patterns, and communication records.
 * Provides management tools for customer data and interactions.
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, Calendar, MapPin, ShoppingBag, 
  ArrowLeft, MoreHorizontal, Edit, Trash2, 
  CreditCard, MessageSquare, FileText, Tag, 
  AlertTriangle, CheckCircle, ChevronRight, X
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

// Mock Customers Data
const mockCustomers = [
  {
    id: 'cust_1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-1234',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA'
    },
    createdAt: '2022-01-10T12:00:00Z',
    lastActive: '2023-03-15T09:45:00Z',
    totalOrders: 12,
    totalSpent: 1245.50,
    averageOrderValue: 103.79,
    preferredPaymentMethod: 'Credit Card',
    segment: 'loyal',
    status: 'active',
    notes: 'Prefers email communication. Interested in premium products.',
    tags: ['premium', 'email-marketing', 'summer-collection'],
  },
  {
    id: 'cust_2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-5678',
    address: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94103',
      country: 'USA'
    },
    createdAt: '2022-11-05T15:30:00Z',
    lastActive: '2023-03-01T14:20:00Z',
    totalOrders: 3,
    totalSpent: 349.99,
    averageOrderValue: 116.66,
    preferredPaymentMethod: 'PayPal',
    segment: 'returning',
    status: 'active',
    notes: 'New customer, recently made second purchase.',
    tags: ['new-arrival', 'tech-products'],
  },
  // Additional mock customers would be here
];

// Mock Order History
const mockOrderHistory = [
  {
    id: 'ORD-1001',
    date: '2023-03-15T14:30:00Z',
    status: 'delivered',
    total: 129.99,
    items: 3,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express'
  },
  {
    id: 'ORD-982',
    date: '2023-02-28T11:15:00Z',
    status: 'delivered',
    total: 89.50,
    items: 1,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard'
  },
  {
    id: 'ORD-879',
    date: '2023-01-15T09:45:00Z',
    status: 'delivered',
    total: 215.75,
    items: 4,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express'
  },
  {
    id: 'ORD-754',
    date: '2022-12-10T16:20:00Z',
    status: 'delivered',
    total: 45.99,
    items: 1,
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard'
  },
  {
    id: 'ORD-632',
    date: '2022-11-05T10:30:00Z',
    status: 'delivered',
    total: 178.50,
    items: 2,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express'
  },
];

// Mock Communication History
const mockCommunications = [
  {
    id: 'COM-001',
    date: '2023-03-10T09:15:00Z',
    type: 'email',
    subject: 'Order Confirmation',
    content: 'Thank you for your order #ORD-1001. Your items will be shipped soon.',
    direction: 'outgoing',
    status: 'delivered'
  },
  {
    id: 'COM-002',
    date: '2023-03-10T14:30:00Z',
    type: 'email',
    subject: 'Shipping Confirmation',
    content: 'Your order #ORD-1001 has been shipped and will arrive in 2-3 business days.',
    direction: 'outgoing',
    status: 'delivered'
  },
  {
    id: 'COM-003',
    date: '2023-03-12T11:45:00Z',
    type: 'support',
    subject: 'Question about Order',
    content: 'Customer inquired about changing the shipping address for order #ORD-1001.',
    direction: 'incoming',
    status: 'resolved'
  },
  {
    id: 'COM-004',
    date: '2023-03-12T13:20:00Z',
    type: 'support',
    subject: 'Response to Address Change',
    content: 'Informed customer that the order has already shipped and cannot be rerouted.',
    direction: 'outgoing',
    status: 'resolved'
  },
  {
    id: 'COM-005',
    date: '2023-03-16T10:05:00Z',
    type: 'email',
    subject: 'Delivery Confirmation',
    content: 'Your order #ORD-1001 has been delivered. Thank you for shopping with us!',
    direction: 'outgoing',
    status: 'delivered'
  },
];

/**
 * Format currency for display
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);
  if (includeTime) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Get initials from name for avatar fallback
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

/**
 * Get CSS class for customer segment badges
 */
const getSegmentBadgeVariant = (segment?: string) => {
  switch (segment) {
    case 'new': return 'default';
    case 'returning': return 'secondary';
    case 'loyal': return 'success';
    case 'at-risk': return 'warning';
    case 'lost': return 'destructive';
    default: return 'outline';
  }
};

/**
 * Get CSS class for order status badges
 */
const getOrderStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'delivered': return 'success';
    case 'shipped': return 'default';
    case 'processing': return 'secondary';
    case 'pending': return 'warning';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

/**
 * Get icon for communication type
 */
const getCommunicationIcon = (type: string) => {
  switch (type) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'support': return <MessageSquare className="h-4 w-4" />;
    case 'note': return <FileText className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

/**
 * Customer Detail Page Component
 */
export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  
  // State for new note
  const [newNote, setNewNote] = useState('');
  
  // Find the customer by ID
  const customer = mockCustomers.find(c => c.id === customerId);
  
  // If customer not found, show error state
  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Customer Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The customer you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/dashboard/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/customers')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Create Order
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                Manage Tags
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Customer Profile Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              {customer.name}
              <Badge variant={getSegmentBadgeVariant(customer.segment)} className="ml-2">
                {customer.segment}
              </Badge>
              <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="ml-2">
                {customer.status}
              </Badge>
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="mr-1 h-4 w-4" />
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Details and preferences for this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Since</h3>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(customer.createdAt)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Active</h3>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(customer.lastActive, true)}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{customer.address.street}</p>
                      <p>
                        {customer.address.city}, {customer.address.state} {customer.address.postal_code}
                      </p>
                      <p>{customer.address.country}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Orders</h3>
                    <div className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                      {customer.totalOrders}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Spent</h3>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Order</h3>
                    <div className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatCurrency(customer.averageOrderValue)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h3>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      {customer.preferredPaymentMethod}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags && customer.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notes and Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Add notes about this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-md border bg-muted/50">
                  <p className="text-sm">{customer.notes || 'No notes available.'}</p>
                </div>
                
                <Textarea 
                  placeholder="Add a note about this customer..." 
                  className="min-h-[100px]"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button disabled={!newNote.trim()} className="ml-auto">
                  Save Note
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent Orders */}
            <Card className="md:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    The last 5 orders placed by this customer
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="#orders">
                    View All Orders
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrderHistory.slice(0, 3).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="hover:underline"
                          >
                            {order.id}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>
                          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" id="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                All orders placed by this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Shipping</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>{order.shippingMethod}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Communications Tab */}
        <TabsContent value="communications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Communication History</CardTitle>
                <CardDescription>
                  Past emails, support tickets, and notes
                </CardDescription>
              </div>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCommunications.map((comm) => (
                  <div key={comm.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="mt-1">
                      <div className="p-2 bg-muted rounded-full">
                        {getCommunicationIcon(comm.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{comm.subject}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{comm.type}</Badge>
                          <Badge variant={comm.status === 'delivered' ? 'success' : 'secondary'}>
                            {comm.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comm.date, true)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{comm.content}</p>
                      <div className="flex items-center gap-2">
                        {comm.direction === 'incoming' ? (
                          <Badge variant="outline" className="text-xs">
                            From Customer
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            To Customer
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Customer Settings</CardTitle>
              <CardDescription>
                Manage customer account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Account Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={customer.status === 'active' ? 'default' : 'outline'}
                      className="justify-start"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Active
                    </Button>
                    <Button 
                      variant={customer.status === 'inactive' ? 'default' : 'outline'}
                      className="justify-start"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Inactive
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="segment" className="text-sm font-medium">
                    Customer Segment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={customer.segment === 'new' ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      New
                    </Button>
                    <Button 
                      variant={customer.segment === 'returning' ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      Returning
                    </Button>
                    <Button 
                      variant={customer.segment === 'loyal' ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      Loyal
                    </Button>
                    <Button 
                      variant={customer.segment === 'at-risk' ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      At Risk
                    </Button>
                    <Button 
                      variant={customer.segment === 'lost' ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      Lost
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {customer.tags && customer.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add new tag..." />
                  <Button variant="outline">Add</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Danger Zone</h3>
                <div className="flex flex-col space-y-2">
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Customer Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 