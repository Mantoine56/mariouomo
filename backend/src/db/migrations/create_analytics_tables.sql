-- Create sales_metrics table
CREATE TABLE IF NOT EXISTS sales_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    average_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_units_sold INTEGER NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    top_products JSONB DEFAULT '[]'::jsonb,
    sales_by_category JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory_metrics table
CREATE TABLE IF NOT EXISTS inventory_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    turnover_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total_sku_count INTEGER NOT NULL DEFAULT 0,
    low_stock_items INTEGER NOT NULL DEFAULT 0,
    out_of_stock_items INTEGER NOT NULL DEFAULT 0,
    inventory_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    dead_stock_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    stock_by_location JSONB DEFAULT '[]'::jsonb,
    category_metrics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer_metrics table
CREATE TABLE IF NOT EXISTS customer_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    new_customers INTEGER NOT NULL DEFAULT 0,
    returning_customers INTEGER NOT NULL DEFAULT 0,
    customer_lifetime_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    retention_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    churn_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    purchase_frequency JSONB DEFAULT '[]'::jsonb,
    customer_segments JSONB DEFAULT '[]'::jsonb,
    geographic_distribution JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create real_time_metrics table
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    active_users INTEGER NOT NULL DEFAULT 0,
    active_sessions INTEGER NOT NULL DEFAULT 0,
    cart_count INTEGER NOT NULL DEFAULT 0,
    cart_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    pending_orders INTEGER NOT NULL DEFAULT 0,
    pending_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    current_popular_products JSONB DEFAULT '[]'::jsonb,
    traffic_sources JSONB DEFAULT '[]'::jsonb,
    page_views JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_sales_metrics_date ON sales_metrics(date);
CREATE INDEX idx_inventory_metrics_date ON inventory_metrics(date);
CREATE INDEX idx_customer_metrics_date ON customer_metrics(date);
CREATE INDEX idx_real_time_metrics_timestamp ON real_time_metrics(timestamp);

-- Function to update timestamp for all metrics tables
CREATE OR REPLACE FUNCTION update_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_sales_metrics_timestamp
BEFORE UPDATE ON sales_metrics
FOR EACH ROW
EXECUTE FUNCTION update_metrics_timestamp();

CREATE TRIGGER update_inventory_metrics_timestamp
BEFORE UPDATE ON inventory_metrics
FOR EACH ROW
EXECUTE FUNCTION update_metrics_timestamp();

CREATE TRIGGER update_customer_metrics_timestamp
BEFORE UPDATE ON customer_metrics
FOR EACH ROW
EXECUTE FUNCTION update_metrics_timestamp();

CREATE TRIGGER update_real_time_metrics_timestamp
BEFORE UPDATE ON real_time_metrics
FOR EACH ROW
EXECUTE FUNCTION update_metrics_timestamp(); 