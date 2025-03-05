/**
 * Simple mock backend server to handle analytics requests
 * This is a temporary solution to test the frontend without the full NestJS backend
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Mock data for analytics endpoints
const salesData = {
  total_sales: 154789.45,
  sales_change: 12.5,
  order_count: 287,
  order_count_change: 8.3,
  average_order_value: 539.33,
  average_order_value_change: 3.8,
  daily_revenue: [
    { date: '2025-02-26', revenue: 5240.25 },
    { date: '2025-02-27', revenue: 4890.75 },
    { date: '2025-02-28', revenue: 6120.50 },
    { date: '2025-03-01', revenue: 8340.25 },
    { date: '2025-03-02', revenue: 7250.40 },
    { date: '2025-03-03', revenue: 5980.30 },
    { date: '2025-03-04', revenue: 6540.80 },
    { date: '2025-03-05', revenue: 7120.60 }
  ]
};

const customersData = {
  new_customers: 145,
  new_customers_change: 15.2,
  returning_customers: 87,
  returning_customers_change: 5.8,
  total_customers: 232,
  total_customers_change: 11.7,
  conversion_rate: 3.2,
  conversion_rate_change: 0.5,
  customers_by_source: [
    { source: 'Direct', count: 89 },
    { source: 'Search', count: 65 },
    { source: 'Social', count: 42 },
    { source: 'Email', count: 26 },
    { source: 'Referral', count: 10 }
  ]
};

const categoryPerformanceData = [
  { category: 'T-Shirts', sales: 45240.75, orders_count: 89, growth: 12.5 },
  { category: 'Jackets', sales: 38750.50, orders_count: 52, growth: 8.7 },
  { category: 'Jeans', sales: 32480.25, orders_count: 68, growth: 5.2 },
  { category: 'Sneakers', sales: 28790.60, orders_count: 45, growth: 15.8 },
  { category: 'Accessories', sales: 9520.35, orders_count: 33, growth: 3.5 }
];

const productPerformanceData = [
  { product: 'Classic White T-Shirt', sku: 'TSH-CW-M', sales: 12540.25, orders_count: 45, inventory: 120 },
  { product: 'Leather Jacket', sku: 'JKT-LTH-L', sales: 18750.50, orders_count: 25, inventory: 28 },
  { product: 'Blue Slim Jeans', sku: 'JNS-BLU-32', sales: 9480.75, orders_count: 32, inventory: 85 },
  { product: 'Vintage Sneakers', sku: 'SNK-VTG-42', sales: 13240.60, orders_count: 38, inventory: 65 },
  { product: 'Canvas Belt', sku: 'ACC-BLT-ML', sales: 2890.35, orders_count: 23, inventory: 150 }
];

// Analytics endpoints
app.get('/analytics/sales', (req, res) => {
  console.log('GET /analytics/sales called with query:', req.query);
  res.json(salesData);
});

app.get('/analytics/customers', (req, res) => {
  console.log('GET /analytics/customers called with query:', req.query);
  res.json(customersData);
});

app.get('/analytics/categories/performance', (req, res) => {
  console.log('GET /analytics/categories/performance called with query:', req.query);
  res.json(categoryPerformanceData);
});

app.get('/analytics/products/performance', (req, res) => {
  console.log('GET /analytics/products/performance called with query:', req.query);
  res.json(productPerformanceData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock backend server is running at http://localhost:${PORT}`);
}); 