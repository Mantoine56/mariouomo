'use client';

/**
 * Customers Listing Page
 * 
 * Displays a comprehensive list of customers with filtering, search, and management options.
 * Allows viewing customer details, order history, and performing various actions.
 */

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

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

// Customer components
import { CustomersTable, Customer } from '@/components/customers/customers-table';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';

// Mock customer data (would be fetched from API in a real app)
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-1234',
    totalOrders: 12,
    totalSpent: 1245.50,
    lastOrderDate: '2023-02-15',
    status: 'active',
    segment: 'loyal',
    createdAt: '2022-01-10',
  },
  {
    id: 'cust_2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-5678',
    totalOrders: 3,
    totalSpent: 349.99,
    lastOrderDate: '2023-03-01',
    status: 'active',
    segment: 'returning',
    createdAt: '2022-11-05',
  },
  {
    id: 'cust_3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-9012',
    totalOrders: 1,
    totalSpent: 89.99,
    lastOrderDate: '2023-03-10',
    status: 'active',
    segment: 'new',
    createdAt: '2023-03-08',
  },
  {
    id: 'cust_4',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '+1 555-3456',
    totalOrders: 8,
    totalSpent: 753.25,
    lastOrderDate: '2023-01-20',
    status: 'inactive',
    segment: 'at-risk',
    createdAt: '2022-04-15',
  },
  {
    id: 'cust_5',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '+1 555-7890',
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: '',
    status: 'inactive',
    segment: 'lost',
    createdAt: '2022-08-01',
  },
  {
    id: 'cust_6',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    phone: '+1 555-2468',
    totalOrders: 5,
    totalSpent: 429.95,
    lastOrderDate: '2023-02-28',
    status: 'active',
    segment: 'returning',
    createdAt: '2022-07-22',
  },
  {
    id: 'cust_7',
    name: 'Sarah Martinez',
    email: 'sarah@example.com',
    phone: '+1 555-1357',
    totalOrders: 18,
    totalSpent: 2345.75,
    lastOrderDate: '2023-03-12',
    status: 'active',
    segment: 'loyal',
    createdAt: '2021-11-10',
  },
];

/**
 * Customers Page Component
 */
export default function CustomersPage() {
  // State for customer data
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  // Current status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Handle data changes from table (e.g., after deletion)
  const handleDataChange = (updatedData: Customer[]) => {
    setCustomers(updatedData);
  };

  // Filter customers by status
  const filteredCustomers = statusFilter === 'all'
    ? customers
    : customers.filter(customer => customer.status === statusFilter);

  // Get count of customers by status
  const getStatusCounts = () => {
    const counts = {
      all: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Refresh customer data (would fetch from API in a real app)
  const refreshData = () => {
    // This would be an API call in a real application
    console.log('Refreshing customer data...');
    // For demo, we'll just reset to the original data
    setCustomers(mockCustomers);
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
          <Button variant="outline" size="icon" onClick={refreshData} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <AddCustomerDialog />
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
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <CustomersTable 
                data={filteredCustomers} 
                onDataChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <CustomersTable 
                data={filteredCustomers} 
                onDataChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <CustomersTable 
                data={filteredCustomers} 
                onDataChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 