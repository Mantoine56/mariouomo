'use client';

/**
 * Customers Listing Page
 * 
 * Displays a comprehensive list of customers with filtering, search, and management options.
 * Allows viewing customer details, order history, and performing various actions.
 */

import { useEffect, useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Customer components
import { CustomersTable, Customer } from '@/components/customers/customers-table';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';

// API Client
import { customerApi, Customer as BackendCustomer } from '@/lib/customer-api';

/**
 * Adapts a backend customer to the frontend customer format
 * @param backendCustomer Customer from the API
 * @returns Customer formatted for the frontend
 */
const adaptCustomerToFrontend = (backendCustomer: BackendCustomer): Customer => {
  return {
    id: backendCustomer.id,
    name: `${backendCustomer.first_name} ${backendCustomer.last_name}`,
    email: backendCustomer.email,
    phone: backendCustomer.phone || '',
    totalOrders: backendCustomer.total_orders,
    totalSpent: backendCustomer.total_spent,
    lastOrderDate: backendCustomer.last_order_date || '',
    status: backendCustomer.status,
    // Determine segment based on orders and spent amount
    segment: determineCustomerSegment(backendCustomer),
    createdAt: backendCustomer.created_at,
  };
};

/**
 * Determines customer segment based on their order history and spending
 * @param customer Backend customer data
 * @returns segment classification (new, returning, loyal, at-risk, lost)
 */
const determineCustomerSegment = (customer: BackendCustomer): string => {
  if (customer.total_orders === 0) {
    return 'lost';
  }
  
  if (customer.total_orders === 1) {
    return 'new';
  }
  
  if (customer.total_orders >= 10 || customer.total_spent >= 1000) {
    return 'loyal';
  }
  
  if (!customer.last_order_date) {
    return 'at-risk';
  }
  
  // Check if last order is more than 3 months ago
  const lastOrderDate = new Date(customer.last_order_date);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  if (lastOrderDate < threeMonthsAgo) {
    return 'at-risk';
  }
  
  return 'returning';
};

/**
 * Customers Page Component
 */
export default function CustomersPage() {
  // State for customer data
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Current status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch customers from the API
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the customer API to fetch customers
      const response = await customerApi.searchCustomers({
        // If filtering by status, pass it to the API
        status: statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' : undefined,
        // Default to a reasonable limit
        limit: 100,
      });
      
      // Transform backend customers to frontend format
      const frontendCustomers = response.items.map(adaptCustomerToFrontend);
      setCustomers(frontendCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers on initial load and when status filter changes
  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  // Handle data changes from table (e.g., after deletion)
  const handleDataChange = (updatedData: Customer[]) => {
    setCustomers(updatedData);
  };

  // Filter customers by status - this is now handled by the API, but we keep it for flexibility
  const filteredCustomers = customers;

  // Get count of customers by status
  const getStatusCounts = () => {
    // Instead of filtering locally, we use the counts we already have
    const counts = {
      all: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Refresh customer data from the API
  const refreshData = () => {
    fetchCustomers();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <Heading
          title="Customers"
          description="Manage your customer base and view customer information"
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData} 
            title="Refresh data"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <AddCustomerDialog onCustomerAdded={refreshData} />
        </div>
      </div>
      <Separator />
      
      {/* Status Tabs */}
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All Customers ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({statusCounts.active})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({statusCounts.inactive})
          </TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              className="ml-2"
              disabled={isLoading}
            >
              Retry
            </Button>
          </div>
        )}
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CustomersTable 
                  data={filteredCustomers} 
                  onDataChange={handleDataChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CustomersTable 
                  data={filteredCustomers} 
                  onDataChange={handleDataChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CustomersTable 
                  data={filteredCustomers} 
                  onDataChange={handleDataChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 