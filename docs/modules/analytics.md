# Analytics Module Documentation

## Overview
The Analytics Module provides comprehensive tracking and analysis capabilities for the Mario Uomo e-commerce platform. It offers real-time monitoring, historical data analysis, and insights into various business metrics.

## Components

### 1. Data Models
- **SalesMetrics**: Tracks revenue, order counts, and average order values
- **InventoryMetrics**: Monitors stock levels, turnover rates, and SKU metrics
- **CustomerMetrics**: Analyzes customer behavior and engagement
- **RealTimeMetrics**: Provides instant platform activity insights

### 2. Services

#### AnalyticsCollectorService
- Collects and stores analytics data
- Handles order creation events
- Processes inventory updates
- Manages customer interaction data

#### AnalyticsAggregatorService
- Aggregates daily metrics
- Runs scheduled aggregation jobs
- Maintains historical data consistency
- Optimizes data storage

#### AnalyticsQueryService
- Provides dashboard data retrieval
- Handles complex analytics queries
- Supports date range filtering
- Offers performance insights

#### RealTimeTrackingService
- Tracks active user sessions
- Monitors page views
- Analyzes traffic sources
- Provides real-time metrics

### 3. WebSocket Gateway
- Manages real-time data streaming
- Handles client subscriptions
- Broadcasts metric updates
- Ensures secure connections

### 4. Analytics Controller Endpoints

#### Sales Analytics
```typescript
GET /analytics/sales/overview
Query Parameters:
  - startDate: Date
  - endDate: Date
```
Returns sales metrics for the specified date range.

#### Inventory Analytics
```typescript
GET /analytics/inventory/overview
Query Parameters:
  - date: Date
```
Returns current inventory status and metrics.

#### Customer Insights
```typescript
GET /analytics/customers/insights
Query Parameters:
  - startDate: Date
  - endDate: Date
```
Returns customer behavior analysis and trends.

#### Real-time Dashboard
```typescript
GET /analytics/realtime/dashboard
```
Returns current platform activity metrics.

#### Product Performance
```typescript
GET /analytics/products/:id/performance
Query Parameters:
  - startDate: Date
  - endDate: Date
```
Returns performance metrics for a specific product.

#### Category Performance
```typescript
GET /analytics/categories/:id/performance
Query Parameters:
  - startDate: Date
  - endDate: Date
```
Returns performance metrics for a product category.

#### Real-time Metrics
```typescript
GET /analytics/realtime/users
GET /analytics/realtime/pageviews
GET /analytics/realtime/traffic
```
Returns various real-time platform metrics.

## Security
- All endpoints require authentication
- Admin-only access via RBAC
- Rate limiting applied
- Data encryption in transit

## Best Practices
1. Use date ranges for historical data queries
2. Subscribe to WebSocket events for real-time updates
3. Implement proper error handling
4. Cache frequently accessed metrics
5. Monitor rate limits

## Integration Example
```typescript
// Subscribe to real-time updates
socket.on('analytics:update', (data) => {
  // Handle real-time analytics update
  updateDashboard(data);
});

// Fetch historical data
async function fetchSalesData(startDate: Date, endDate: Date) {
  const response = await fetch(
    `/analytics/sales/overview?startDate=${startDate}&endDate=${endDate}`
  );
  return response.json();
}
```

## Error Handling
The module uses standard HTTP status codes:
- 200: Successful request
- 400: Invalid parameters
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 429: Too many requests
- 500: Server error

## Performance Considerations
1. Use appropriate date ranges to limit data size
2. Implement client-side caching where appropriate
3. Use WebSocket connections for real-time data
4. Consider implementing data aggregation
5. Monitor query performance
