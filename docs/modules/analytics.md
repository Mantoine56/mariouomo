# Analytics Module Documentation

## Overview
The Analytics Module provides comprehensive tracking and analysis capabilities for the Mario Uomo e-commerce platform. It offers real-time monitoring, historical data analysis, and insights into various business metrics.

## Components

### 1. Data Models
- **SalesMetrics**: Tracks revenue, order counts, and average order values
- **InventoryMetrics**: Monitors stock levels, turnover rates, and SKU metrics
- **CustomerMetrics**: Analyzes customer behavior and engagement
- **RealTimeMetrics**: Provides instant platform activity insights
- **PageView**: Tracks individual page views and user interactions
- **ActiveUser**: Monitors currently active users on the platform

### 2. Services

#### AnalyticsQueryService
Provides dashboard data retrieval with type-safe implementations:

```typescript
interface RawSalesMetrics {
  revenue: number;
  orders: number;
  avg_order_value: number;
  date: Date;
}

interface RawInventoryMetrics {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  turnover_rate: number;
  date: Date;
}

interface RawCustomerMetrics {
  retention_rate: number;
  new_customers: number;
  repeat_customers: number;
  date: Date;
}
```

Key Features:
- Type-safe query results with TypeORM
- Efficient data aggregation
- Comprehensive error handling
- Null-safe value access

#### RealTimeTrackingService
Handles real-time analytics tracking:
- Active user monitoring
- Page view tracking
- Performance metrics collection
- Traffic source analysis

### 3. WebSocket Gateway
The Analytics Gateway (`AnalyticsGateway`) provides real-time analytics updates through WebSocket connections.

#### Connection Management
- Handles client connections and disconnections
- Tracks active dashboard sessions
- Manages client subscriptions to different metric types
- Ensures secure access through JWT authentication and role-based guards

#### Subscription Types
```typescript
// Subscribe to real-time metrics (Admin only)
socket.emit('subscribe_realtime');

// Subscribe to sales metrics
socket.emit('subscribe_sales');

// Subscribe to inventory metrics
socket.emit('subscribe_inventory');

// Subscribe to customer metrics
socket.emit('subscribe_customers');
```

#### Event Types
```typescript
// Real-time metrics update
socket.on('realtime_update', (metrics: RealTimeMetrics) => {
  // Handle real-time metrics update
});

// Sales metrics update
socket.on('sales_update', (metrics: SalesMetrics) => {
  // Handle sales metrics update
});

// Inventory metrics update
socket.on('inventory_update', (metrics: InventoryMetrics) => {
  // Handle inventory metrics update
});

// Customer metrics update
socket.on('customer_update', (metrics: CustomerMetrics) => {
  // Handle customer metrics update
});
```

#### Activity Tracking
The gateway also tracks user activity and page views:
```typescript
// Track page view
socket.emit('page.view', { page: '/products' });

// Track traffic source
socket.emit('traffic.source', { source: 'google' });
```

#### Security
- All connections require JWT authentication
- Real-time metrics subscription requires ADMIN role
- Client connections are automatically cleaned up on disconnect
- Rate limiting is applied to prevent abuse

#### Implementation Details
- Uses a private subscription system for efficient message routing
- Maintains separate subscriptions for different metric types
- Broadcasts updates only to subscribed clients
- Handles connection cleanup and resource management

### 4. Analytics Controller Endpoints

#### Sales Analytics
```typescript
GET /analytics/sales
Query Parameters:
  - startDate: Date
  - endDate: Date

Response:
{
  revenue: number;
  orders: number;
  averageOrderValue: number;
  trend: {
    date: Date;
    revenue: number;
    orders: number;
  }[];
}
```

#### Inventory Analytics
```typescript
GET /analytics/inventory
Query Parameters:
  - date: Date

Response:
{
  current: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    turnoverRate: number;
  };
  turnoverTrend: {
    date: Date;
    turnoverRate: number;
  }[];
}
```

#### Customer Insights
```typescript
GET /analytics/customers
Query Parameters:
  - startDate: Date
  - endDate: Date

Response:
{
  retention: number;
  churn: number;
  newCustomers: number;
  repeatCustomers: number;
  trend: {
    date: Date;
    retention: number;
    churn: number;
  }[];
}
```

#### Product Performance
```typescript
GET /analytics/products/performance
Query Parameters:
  - startDate: Date
  - endDate: Date

Response:
{
  sales: number;
  revenue: number;
  orders: number;
  views: number;
  conversionRate: number;
  trend: {
    date: Date;
    sales: number;
    revenue: number;
    orders: number;
    conversionRate: number;
  }[];
}
```

#### Category Performance
```typescript
GET /analytics/categories/performance
Query Parameters:
  - startDate: Date
  - endDate: Date

Response:
{
  sales: number;
  revenue: number;
  orders: number;
  products: number;
  trend: {
    date: Date;
    sales: number;
    revenue: number;
    orders: number;
  }[];
}
```

#### Traffic Source Distribution
```typescript
GET /analytics/traffic-sources
Response:
{
  sources: {
    source: string;
    visits: number;
    conversion_rate: number;
  }[];
}
```

## Testing
The Analytics module includes comprehensive unit tests covering all major functionality:

```typescript
describe('AnalyticsController', () => {
  // Basic controller instantiation
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Sales analytics
  it('should get sales analytics', async () => {
    const result = await controller.getSales(startDate, endDate);
    expect(result).toHaveProperty('revenue');
    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('trend');
  });

  // Inventory analytics
  it('should get inventory analytics', async () => {
    const result = await controller.getInventory(date);
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('turnoverTrend');
  });

  // Customer analytics
  it('should get customer analytics', async () => {
    const result = await controller.getCustomers(startDate, endDate);
    expect(result).toHaveProperty('retention');
    expect(result).toHaveProperty('churn');
    expect(result).toHaveProperty('trend');
  });

  // Real-time analytics
  it('should get real-time dashboard data', async () => {
    const result = await controller.getRealTimeDashboard();
    expect(result).toHaveProperty('activeUsers');
    expect(result).toHaveProperty('pageViews');
  });
});
```

### Test Coverage
- Controller endpoints
- Service methods
- Data transformations
- Error handling
- Type safety
- Null value handling

## Security
- All endpoints require authentication
- Admin-only access via RBAC
- Rate limiting applied
- Data encryption in transit
- Type-safe implementations
- Proper error handling

## Best Practices
1. Use type-safe interfaces for all database queries
2. Handle null values with nullish coalescing
3. Implement comprehensive error handling
4. Use proper TypeORM query builders
5. Follow consistent naming conventions
6. Write thorough unit tests
7. Document API responses

## Integration Example
```typescript
// Fetch sales analytics with type safety
interface SalesAnalytics {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  trend: Array<{
    date: Date;
    revenue: number;
    orders: number;
  }>;
}

async function fetchSalesAnalytics(
  startDate: Date,
  endDate: Date
): Promise<SalesAnalytics> {
  const response = await fetch(
    `/analytics/sales?startDate=${startDate}&endDate=${endDate}`
  );
  return response.json();
}
```

## Error Handling
The module uses standard HTTP status codes:
- 200: Successful request
- 400: Invalid parameters
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Server error

Error responses include detailed messages and proper type information.
