-- Analytics Tables Migration Script
-- This script adds missing indexes and columns to existing analytics tables

-- Note: Tables already exist in the database, so we're only adding missing indexes and columns

-- Add missing indexes for efficient querying

-- Sales Metrics Indexes
-- idx_sales_metrics_date already exists
CREATE INDEX IF NOT EXISTS idx_sales_metrics_created_at ON sales_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_total_revenue ON sales_metrics(total_revenue);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_total_orders ON sales_metrics(total_orders);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_date_range ON sales_metrics(date, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_top_products_gin ON sales_metrics USING GIN (top_products);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_sales_by_category_gin ON sales_metrics USING GIN (sales_by_category);

-- Inventory Metrics Indexes
-- idx_inventory_metrics_date already exists
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_created_at ON inventory_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_turnover_rate ON inventory_metrics(turnover_rate);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_low_stock ON inventory_metrics(low_stock_items);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_out_of_stock ON inventory_metrics(out_of_stock_items);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_date_range ON inventory_metrics(date, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_stock_by_location_gin ON inventory_metrics USING GIN (stock_by_location);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_category_metrics_gin ON inventory_metrics USING GIN (category_metrics);

-- Customer Metrics Indexes
-- idx_customer_metrics_date already exists
CREATE INDEX IF NOT EXISTS idx_customer_metrics_created_at ON customer_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_retention_rate ON customer_metrics(retention_rate);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_churn_rate ON customer_metrics(churn_rate);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_date_range ON customer_metrics(date, created_at);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_purchase_frequency_gin ON customer_metrics USING GIN (purchase_frequency);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_customer_segments_gin ON customer_metrics USING GIN (customer_segments);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_geographic_distribution_gin ON customer_metrics USING GIN (geographic_distribution);

-- Real-Time Metrics Indexes
-- idx_real_time_metrics_timestamp already exists
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_created_at ON real_time_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_active_users ON real_time_metrics(active_users);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_timestamp_range ON real_time_metrics(timestamp, created_at);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_current_popular_products_gin ON real_time_metrics USING GIN (current_popular_products);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_traffic_sources_gin ON real_time_metrics USING GIN (traffic_sources);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_page_views_gin ON real_time_metrics USING GIN (page_views);

-- Add additional columns for analytics improvements

-- Add traffic source column to customer_metrics for better filtering
ALTER TABLE customer_metrics ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_traffic_source ON customer_metrics(traffic_source);

-- Add product_id and category_id columns to sales_metrics for direct joins
ALTER TABLE sales_metrics ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE sales_metrics ADD COLUMN IF NOT EXISTS category_id UUID;
CREATE INDEX IF NOT EXISTS idx_sales_metrics_product_id ON sales_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_category_id ON sales_metrics(category_id);

-- Add store_id column to all metrics tables for multi-store support
ALTER TABLE sales_metrics ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE inventory_metrics ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE customer_metrics ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE real_time_metrics ADD COLUMN IF NOT EXISTS store_id UUID;

CREATE INDEX IF NOT EXISTS idx_sales_metrics_store_id ON sales_metrics(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_store_id ON inventory_metrics(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_store_id ON customer_metrics(store_id);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_store_id ON real_time_metrics(store_id);

-- Add views column to sales_metrics for conversion rate calculations
ALTER TABLE sales_metrics ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_sales_metrics_views ON sales_metrics(views);

-- Add last_purchase_date to customer_metrics for retention analysis
ALTER TABLE customer_metrics ADD COLUMN IF NOT EXISTS last_purchase_date DATE;
CREATE INDEX IF NOT EXISTS idx_customer_metrics_last_purchase_date ON customer_metrics(last_purchase_date);

-- Removing function-based indexes to avoid IMMUTABLE function issues
-- Instead, we'll add regular indexes on created_at and query time extraction
CREATE INDEX IF NOT EXISTS idx_customer_metrics_created_at_for_cohort ON customer_metrics(created_at);

-- Add regular indexes instead of partial indexes to avoid function issues
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_low_stock_items ON inventory_metrics(low_stock_items);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_high_value ON customer_metrics(customer_lifetime_value);
