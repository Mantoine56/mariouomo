# Analytics Tables Improvements

This document outlines the improvements made to the analytics tables in the Mario Uomo e-commerce platform.

## Overview

The analytics module requires efficient database tables to store and retrieve metrics data. We've enhanced the existing analytics tables with:

1. Additional indexes for efficient querying
2. Enhanced schema with additional columns for better analytics
3. Optimized indexing strategy for common query patterns
4. Multi-store support for scalability

## Tables Structure

### Sales Metrics Table

The `sales_metrics` table stores aggregated sales data for analysis:

- Primary metrics: revenue, orders, units sold
- Time-based aggregation by date
- Category and product performance data
- Conversion rate metrics

**Optimizations:**
- Date-based indexes for time-series queries
- GIN indexes for JSON fields (top_products, sales_by_category)
- New columns for direct joins (product_id, category_id)
- Store ID for multi-tenant support
- Views count for conversion rate calculations

### Inventory Metrics Table

The `inventory_metrics` table tracks inventory health and movement:

- Stock levels and turnover rates
- Low stock and out-of-stock monitoring
- Inventory valuation
- Location-based stock distribution

**Optimizations:**
- Indexes for common filtering conditions (turnover_rate, low_stock_items)
- GIN indexes for location and category JSON data
- Date range indexes for time-series analysis
- Store ID for multi-tenant support

### Customer Metrics Table

The `customer_metrics` table provides insights into customer behavior:

- New vs. returning customer metrics
- Retention and churn analysis
- Customer lifetime value tracking
- Segmentation and geographic distribution

**Optimizations:**
- Date range indexes for time-series analysis
- Traffic source tracking column
- Last purchase date column for retention analysis
- GIN indexes for JSON segment data
- Store ID for multi-tenant support

### Real-Time Metrics Table

The `real_time_metrics` table captures current platform activity:

- Active users and sessions
- Cart metrics and pending orders
- Popular products and traffic sources
- Page view distribution

**Optimizations:**
- Timestamp-based indexes for time-series data
- GIN indexes for JSON fields (current_popular_products, traffic_sources, page_views)
- Active users indexing for performance monitoring
- Store ID for multi-tenant support

## Index Strategy

Our indexing strategy focuses on:

1. **Time-Series Efficiency**: Optimized date/timestamp indexes for time-range queries
2. **JSON Data Access**: GIN indexes for efficient JSON field querying
3. **Common Query Patterns**: Standard indexes for frequently filtered columns
4. **Join Performance**: Indexes on foreign keys for efficient joins
5. **Multi-Store Support**: Store-based indexing for multi-tenant queries

## Additional Improvements

1. **Multi-Store Architecture**: Store ID columns for multi-tenant support
2. **Direct Joins**: Product and category IDs for direct table joins
3. **Conversion Tracking**: Views column for accurate conversion rate calculations
4. **Retention Analysis**: Last purchase date for customer retention metrics
5. **Traffic Source Analysis**: Dedicated column for traffic source attribution

## Implementation Notes

- The migration script is idempotent (safe to run multiple times)
- All operations use IF NOT EXISTS to prevent errors on repeated execution
- GIN indexes are used for JSONB fields to enable efficient querying of JSON data
- Avoided function-based indexes to ensure compatibility with Supabase
- Simplified index expressions to avoid IMMUTABLE function requirements

## Next Steps

1. Implement data retention policies for analytics tables
2. Set up automated aggregation processes for historical data
3. Create materialized views for complex dashboard queries
4. Implement table partitioning for very large datasets
5. Develop stored procedures for common analytics calculations
