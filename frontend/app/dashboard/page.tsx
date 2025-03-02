/**
 * Dashboard Home Page
 * 
 * Displays an overview of key metrics and recent activities
 * Provides quick access to common actions and visualizes important data
 */
import React from "react";
import Link from "next/link";
import { 
  BarChart3, 
  PackageOpen, 
  ShoppingCart, 
  Users,
  CreditCard,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityList, type ActivityItem } from "@/components/ui/activity-list";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function DashboardPage() {
  // Mock data for dashboard statistics
  const stats = [
    { 
      name: "Total Revenue", 
      value: "$12,345.67", 
      change: "+12%", 
      changeDirection: "increase" as const,
      description: "Compared to last month",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      variant: "primary" as const
    },
    { 
      name: "Orders", 
      value: "156", 
      change: "+8%", 
      changeDirection: "increase" as const,
      description: "42 processed today",
      icon: <ShoppingCart className="h-5 w-5 text-indigo-500" />,
      variant: "info" as const
    },
    { 
      name: "Customers", 
      value: "2,345", 
      change: "+15%", 
      changeDirection: "increase" as const,
      description: "237 new this month",
      icon: <Users className="h-5 w-5 text-green-500" />,
      variant: "success" as const
    },
    { 
      name: "Products", 
      value: "432", 
      change: "+3", 
      changeDirection: "increase" as const,
      description: "28 out of stock",
      icon: <PackageOpen className="h-5 w-5 text-amber-500" />,
      variant: "warning" as const
    },
  ];

  // Mock data for recent orders
  const recentOrders = [
    { id: "ORD-1234", customer: "John Doe", date: "2025-03-01", amount: "$129.99", status: "Completed" },
    { id: "ORD-1235", customer: "Jane Smith", date: "2025-03-01", amount: "$89.99", status: "Processing" },
    { id: "ORD-1236", customer: "Robert Johnson", date: "2025-03-01", amount: "$259.99", status: "Completed" },
    { id: "ORD-1237", customer: "Emily Williams", date: "2025-02-29", amount: "$199.99", status: "Shipped" },
    { id: "ORD-1238", customer: "Michael Brown", date: "2025-02-29", amount: "$149.99", status: "Processing" },
  ];

  // Mock data for recent activities
  const recentActivities: ActivityItem[] = [
    {
      id: "act-1",
      type: "order",
      title: "New order received",
      description: "Order #ORD-1234 ($129.99) from John Doe",
      time: "10 minutes ago",
      link: {
        href: "/dashboard/orders/ORD-1234",
        label: "View order"
      }
    },
    {
      id: "act-2",
      type: "payment",
      title: "Payment received",
      description: "$259.99 payment for order #ORD-1236",
      time: "45 minutes ago",
      user: {
        name: "Robert Johnson"
      }
    },
    {
      id: "act-3",
      type: "shipment",
      title: "Order shipped",
      description: "Order #ORD-1237 has been shipped via Express",
      time: "2 hours ago",
      link: {
        href: "/dashboard/orders/ORD-1237",
        label: "Track shipment"
      }
    },
    {
      id: "act-4",
      type: "product",
      title: "Low stock alert",
      description: "Product 'Italian Leather Loafers' is running low (3 left)",
      time: "3 hours ago",
      link: {
        href: "/dashboard/products/123",
        label: "Manage inventory"
      }
    },
    {
      id: "act-5",
      type: "customer",
      title: "New customer registered",
      description: "Michael Brown created an account",
      time: "5 hours ago",
      link: {
        href: "/dashboard/customers/456",
        label: "View profile"
      }
    }
  ];

  // Quick action items
  const quickActions = [
    { 
      title: "Create Order", 
      icon: <ClipboardList className="h-5 w-5" />, 
      href: "/dashboard/orders/new", 
      color: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Add Product", 
      icon: <PackageOpen className="h-5 w-5" />, 
      href: "/dashboard/products/new", 
      color: "bg-amber-50 text-amber-600"
    },
    { 
      title: "Process Payments", 
      icon: <CreditCard className="h-5 w-5" />, 
      href: "/dashboard/payments", 
      color: "bg-green-50 text-green-600"
    },
    { 
      title: "View Reports", 
      icon: <TrendingUp className="h-5 w-5" />, 
      href: "/dashboard/reports", 
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with page title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">New Order</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            change={stat.change}
            changeDirection={stat.changeDirection}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <DashboardCard
          title="Recent Orders"
          headerAction={
            <Button variant="link" asChild>
              <Link href="/dashboard/orders">View all</Link>
            </Button>
          }
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-4 text-sm text-gray-500">{order.customer}</td>
                    <td className="py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="py-4 text-sm text-gray-500">{order.amount}</td>
                    <td className="py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-medium">
                      <Button variant="link" asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>
                          View<span className="sr-only">, {order.id}</span>
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Activity Feed */}
        <DashboardCard
          title="Recent Activity"
          description="Latest actions across your store"
          className="lg:col-span-1"
        >
          <ActivityList 
            activities={recentActivities} 
            maxItems={5}
          />
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 p-2 rounded-lg mr-4 ${action.color}`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">
                  {action.title}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            </Link>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
} 