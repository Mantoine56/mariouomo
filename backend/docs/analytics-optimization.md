# Analytics Optimization Documentation

This document outlines the analytics optimization features implemented in the Mario Uomo e-commerce platform, including materialized views, data retention policies, and automated aggregation processes.

## Overview

The analytics optimization features are designed to improve the performance and scalability of the analytics system by:

1. Using materialized views for complex dashboard queries
2. Implementing data retention policies to manage data growth
3. Setting up automated aggregation processes for historical data

## Materialized Views

Materialized views are database objects that store the results of a query. Unlike regular views, materialized views cache the result set, which significantly improves query performance for complex analytics operations.

### Implemented Materialized Views

We have implemented the following materialized views:

1. **mv_sales_dashboard** - Aggregates sales metrics by day and store
   - Revenue, orders, units sold, average order value, discounts, conversion rate

2. **mv_customer_insights** - Aggregates customer metrics by day, store, and traffic source
   - New customers, returning customers, lifetime value, retention rate, churn rate

3. **mv_inventory_status** - Aggregates inventory metrics by day and store
   - Total items, low stock items, out-of-stock items, turnover rate, inventory value

### Refresh Schedule

Materialized views are automatically refreshed:
- Every hour via a scheduled task
- Can be manually refreshed via the admin API endpoint

## Data Retention Policies

To manage database growth and optimize performance, we've implemented the following data retention policies:

1. **Real-time metrics**: Retained for 90 days
2. **Detailed daily data**: 
   - Full retention for the most recent 90 days
   - For data between 90 days and 2 years old, only the first day of each month is kept
   - Data older than 2 years is removed completely

These policies are automatically applied weekly and can be manually triggered via the admin API.

## Automated Aggregation

Monthly aggregation processes automatically consolidate daily metrics into monthly summaries, which:

1. Reduces the total number of records in the database
2. Maintains historical trends for long-term analysis
3. Improves query performance for historical data

The aggregation process runs automatically on the 1st day of each month and can be manually triggered via the admin API.

## API Endpoints

### Optimized Analytics Endpoints

The following endpoints provide access to the optimized analytics data:

- `GET /analytics/optimized/sales-dashboard` - Get sales dashboard data
- `GET /analytics/optimized/customer-insights` - Get customer insights data
- `GET /analytics/optimized/inventory-status` - Get inventory status data

### Admin Endpoints

The following endpoints are available for admin users:

- `POST /analytics/optimized/refresh-views` - Manually refresh materialized views
- `POST /analytics/optimized/aggregate-data` - Manually trigger data aggregation
- `POST /analytics/optimized/apply-retention-policy` - Manually apply data retention policy

## Implementation Details

### Database Migration

A database migration script (`1709770000-enhance-analytics-features.ts`) has been created to:

1. Create the materialized views
2. Create functions for refreshing views, aggregating data, and applying retention policies
3. Set up scheduled tasks using pg_cron (if available)

### NestJS Services

The following services have been implemented:

1. **AnalyticsMaterializedViewsService** - Provides methods for querying materialized views and managing data
2. **AnalyticsScheduledTasksService** - Handles periodic execution of analytics maintenance operations

## Usage Examples

### Querying Optimized Sales Dashboard

```typescript
// Frontend code example
async function fetchSalesDashboard(storeId, startDate, endDate) {
  const response = await fetch(
    `/api/analytics/optimized/sales-dashboard?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
}
```

### Admin: Manually Refreshing Views

```typescript
// Admin dashboard code example
async function refreshMaterializedViews() {
  const response = await fetch('/api/analytics/optimized/refresh-views', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

## Performance Considerations

1. **Query Optimization**: Materialized views significantly reduce query complexity and execution time
2. **Data Volume Management**: Retention policies prevent database bloat
3. **Aggregation**: Monthly aggregation reduces the number of records while maintaining trend visibility

## Future Enhancements

Potential future enhancements to consider:

1. Implement partial refreshes of materialized views for even better performance
2. Add more granular retention policies based on data importance
3. Implement data archiving to cold storage for compliance requirements
4. Create additional materialized views for other complex analytics queries
