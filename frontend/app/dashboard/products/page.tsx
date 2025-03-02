/**
 * Products Management Page
 * 
 * Displays a list of products with filtering, sorting, and search capabilities
 * Allows admins to manage product inventory, categories, and attributes
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Package, Plus, Search } from 'lucide-react';

// Mock product data
const products = [
  { 
    id: 'PROD-001', 
    name: 'Classic Cotton T-Shirt',
    category: 'Apparel',
    price: 29.99,
    inventory: 125,
    status: 'Active'
  },
  { 
    id: 'PROD-002', 
    name: 'Slim Fit Denim Jeans',
    category: 'Apparel',
    price: 79.99,
    inventory: 83,
    status: 'Active'
  },
  { 
    id: 'PROD-003', 
    name: 'Leather Weekend Bag',
    category: 'Accessories',
    price: 159.99,
    inventory: 21,
    status: 'Active'
  },
  { 
    id: 'PROD-004', 
    name: 'Wool Blend Overcoat',
    category: 'Outerwear',
    price: 249.99,
    inventory: 17,
    status: 'Active'
  },
  { 
    id: 'PROD-005', 
    name: 'Italian Leather Loafers',
    category: 'Footwear',
    price: 189.99,
    inventory: 32,
    status: 'Active'
  },
  { 
    id: 'PROD-006', 
    name: 'Silk Dress Tie',
    category: 'Accessories',
    price: 49.99,
    inventory: 65,
    status: 'Active'
  },
  { 
    id: 'PROD-007', 
    name: 'Cashmere Scarf',
    category: 'Accessories',
    price: 79.99,
    inventory: 42,
    status: 'Active'
  },
  { 
    id: 'PROD-008', 
    name: 'Aviator Sunglasses',
    category: 'Accessories',
    price: 129.99,
    inventory: 18,
    status: 'Low Stock'
  },
  { 
    id: 'PROD-009', 
    name: 'Pima Cotton Dress Shirt',
    category: 'Apparel',
    price: 89.99,
    inventory: 0,
    status: 'Out of Stock'
  },
  { 
    id: 'PROD-010', 
    name: 'Merino Wool Sweater',
    category: 'Apparel',
    price: 109.99,
    inventory: 28,
    status: 'Active'
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 md:col-span-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search products..."
            />
          </div>
        </div>
        <select className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Categories</option>
          <option value="apparel">Apparel</option>
          <option value="accessories">Accessories</option>
          <option value="footwear">Footwear</option>
          <option value="outerwear">Outerwear</option>
        </select>
      </div>
      
      {/* Products list */}
      <DashboardCard title="Product Inventory" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Inventory</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{product.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.category}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${product.price.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.inventory}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Button variant="link" asChild>
                      <a href={`/dashboard/products/${product.id}`}>
                        Edit<span className="sr-only">, {product.name}</span>
                      </a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">97</span> products
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  2
                </a>
                <a
                  href="#"
                  className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                >
                  3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                  ...
                </span>
                <a
                  href="#"
                  className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                >
                  9
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  10
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
} 