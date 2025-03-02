/**
 * Dashboard Home Page
 * 
 * Displays an overview of key metrics and recent activities
 * Adapted from the next-shadcn-dashboard-starter template.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  PackageOpen,
  ShoppingCart,
  Users
} from "lucide-react";

export default function DashboardPage() {
  // Mock data for dashboard statistics
  const stats = [
    { 
      name: "Total Revenue", 
      value: "$12,345.67", 
      change: "+12%", 
      changeType: "increase",
      icon: <BarChart3 className="h-5 w-5 text-primary" /> 
    },
    { 
      name: "Orders", 
      value: "156", 
      change: "+8%", 
      changeType: "increase",
      icon: <ShoppingCart className="h-5 w-5 text-indigo-500" /> 
    },
    { 
      name: "Customers", 
      value: "2,345", 
      change: "+15%", 
      changeType: "increase",
      icon: <Users className="h-5 w-5 text-green-500" /> 
    },
    { 
      name: "Products", 
      value: "432", 
      change: "+3", 
      changeType: "increase",
      icon: <PackageOpen className="h-5 w-5 text-amber-500" /> 
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button size="sm">New Order</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.changeType === "increase" ? (
                      <svg className="h-5 w-5 flex-shrink-0 self-center text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 flex-shrink-0 self-center text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="sr-only">
                      {stat.changeType === "increase" ? "Increased" : "Decreased"} by
                    </span>
                    {stat.change}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
          <Button variant="link" asChild>
            <a href="/dashboard/orders">View all</a>
          </Button>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{order.id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.customer}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.amount}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Button variant="link" asChild>
                        <a href={`/dashboard/orders/${order.id}`}>
                          View<span className="sr-only">, {order.id}</span>
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 