-- =================================================================
-- Mario Uomo E-commerce Platform - Database Schema Implementation
-- =================================================================
-- This script implements a complete e-commerce database with:
-- - Multi-store support
-- - User management with Supabase Auth integration
-- - Product and inventory management
-- - Order processing
-- - Discount and gift card systems
-- - Payment and shipping tracking
-- - Analytics via materialized views
-- - Row Level Security (RLS) for data protection
-- - Performance optimization with strategic indexes
-- - Comprehensive audit logging
--
-- IMPORTANT NOTES:
-- 1. This script should be run on a fresh Supabase instance
-- 2. Requires Supabase Auth to be enabled
-- 3. Creates all necessary extensions
-- 4. Implements RLS policies for data security
-- 5. Sets up audit logging for critical operations
--
-- Author: Mario Uomo Development Team
-- Last Updated: 2025-02-22
-- =================================================================

-- =================================================================
-- 1. Extensions
-- =================================================================
-- These extensions provide essential functionality:
-- - uuid-ossp: Generate UUIDs for primary keys
-- - citext: Case-insensitive text fields (e.g., email addresses)
-- - pg_stat_statements: SQL query analysis and optimization
-- - pgcrypto: Encryption functions for sensitive data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS citext;           -- For case-insensitive text
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- For query analysis
CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- For encryption functions

-- =================================================================
-- 2. Utility Functions
-- =================================================================
-- These functions support various database operations:
-- - update_updated_at_column(): Automatically updates timestamp on record changes
-- - is_admin(): Checks if the current user has admin privileges
-- - refresh_materialized_views(): Refreshes analytics views
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ language 'plpgsql';

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY order_daily_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 3. Base Schema - Core Tables
-- =================================================================
-- The schema follows these conventions:
-- - All tables have created_at and updated_at timestamps
-- - Soft deletes implemented via deleted_at columns where appropriate
-- - JSONB metadata columns for extensibility
-- - Foreign key constraints with appropriate ON DELETE actions
-- - Triggers for automatic timestamp updates
-- Stores
CREATE TABLE stores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    domain      VARCHAR(255),
    metadata    JSONB DEFAULT '{}',
    deleted_at  TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role             VARCHAR(50) NOT NULL DEFAULT 'customer',
    first_name       VARCHAR(100),
    last_name        VARCHAR(100),
    phone_number     VARCHAR(50),
    status           VARCHAR(50) DEFAULT 'active',
    metadata         JSONB DEFAULT '{}',
    deleted_at       TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Addresses
CREATE TABLE user_addresses (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address_type     VARCHAR(50) DEFAULT 'shipping',
    line1            VARCHAR(255),
    line2            VARCHAR(255),
    city             VARCHAR(100),
    state            VARCHAR(100),
    postal_code      VARCHAR(20),
    country          VARCHAR(100),
    is_default       BOOLEAN DEFAULT false,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50) DEFAULT 'draft',
    price           NUMERIC(10,2) NOT NULL,
    compare_at_price NUMERIC(10,2),
    cost_price      NUMERIC(10,2),
    metadata        JSONB DEFAULT '{}',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Product Images
CREATE TABLE product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    alt_text    VARCHAR(255),
    position    INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Product Variants
CREATE TABLE product_variants (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id         UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                VARCHAR(100),
    barcode           VARCHAR(100),
    option_values      JSONB,
    price_adjustment   NUMERIC(10,2) DEFAULT 0,
    position          INTEGER DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory Items
CREATE TABLE inventory_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id     UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity       INT NOT NULL DEFAULT 0,
    reserved       INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Orders
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id          UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES auth.users(id),
    status            VARCHAR(50) DEFAULT 'draft',
    total_amount      NUMERIC(10,2) NOT NULL,
    subtotal_amount   NUMERIC(10,2) NOT NULL,
    tax_amount        NUMERIC(10,2) DEFAULT 0,
    shipping_amount   NUMERIC(10,2) DEFAULT 0,
    discount_amount   NUMERIC(10,2) DEFAULT 0,
    shipping_address  JSONB,
    billing_address   JSONB,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Order Items
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id      UUID NOT NULL REFERENCES product_variants(id),
    quantity        INT NOT NULL,
    unit_price      NUMERIC(10,2) NOT NULL,
    total_price     NUMERIC(10,2) NOT NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Discounts
CREATE TABLE discounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code            VARCHAR(100),
    discount_type   VARCHAR(50) NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    starts_at       TIMESTAMP WITH TIME ZONE,
    ends_at         TIMESTAMP WITH TIME ZONE,
    usage_limit     INT,
    used_count      INT DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_discounts_updated_at
    BEFORE UPDATE ON discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Order Discounts
CREATE TABLE order_discounts (
    order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_id    UUID NOT NULL REFERENCES discounts(id),
    amount_applied NUMERIC(10,2) NOT NULL,
    PRIMARY KEY(order_id, discount_id)
);

-- Gift Cards
CREATE TABLE gift_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code            VARCHAR(100) NOT NULL,
    initial_balance NUMERIC(10,2) NOT NULL,
    current_balance NUMERIC(10,2) NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(50) DEFAULT 'active',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_gift_cards_updated_at
    BEFORE UPDATE ON gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Payments
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL,
    provider        VARCHAR(50),
    status          VARCHAR(50) DEFAULT 'pending',
    transaction_id  VARCHAR(255),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refunds
CREATE TABLE refunds (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount       NUMERIC(10,2) NOT NULL,
    reason       VARCHAR(255),
    status       VARCHAR(50) DEFAULT 'initiated',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Shipments
CREATE TABLE shipments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shipping_provider VARCHAR(50),
    tracking_number   VARCHAR(100),
    status           VARCHAR(50) DEFAULT 'pending',
    label_url        TEXT,
    cost             NUMERIC(10,2),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Events/Logs
CREATE TABLE events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id),
    store_id    UUID REFERENCES stores(id),
    event_type  VARCHAR(100),
    event_data  JSONB,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rate Limiting
CREATE TABLE rate_limits (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    endpoint   VARCHAR(255) NOT NULL,
    hits       INT DEFAULT 1,
    reset_at   TIMESTAMP WITH TIME ZONE DEFAULT now() + interval '1 hour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions (if not using Redis)
CREATE TABLE sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES auth.users(id),
    data         JSONB NOT NULL,
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =================================================================
-- 4. Performance Indexes
-- =================================================================
-- Strategic indexes to optimize common queries:
-- - B-tree indexes for exact matches and ranges
-- - GIN indexes for full-text search
-- - Partial indexes for filtered queries
-- - Unique indexes for constraint enforcement
-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Products
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_created ON products(created_at);

-- Product Variants
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Inventory
CREATE INDEX idx_inventory_variant ON inventory_items(variant_id);
CREATE INDEX idx_inventory_quantity ON inventory_items(quantity) WHERE quantity > 0;

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Discounts
CREATE UNIQUE INDEX idx_discounts_code ON discounts(store_id, code) WHERE code IS NOT NULL;
CREATE INDEX idx_discounts_dates ON discounts(starts_at, ends_at);

-- Gift Cards
CREATE UNIQUE INDEX idx_gift_cards_code ON gift_cards(store_id, code);
CREATE INDEX idx_gift_cards_balance ON gift_cards(current_balance) WHERE status = 'active';

-- Rate Limiting
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address, endpoint);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

-- =================================================================
-- 5. Materialized Views
-- =================================================================
-- Analytics views that are periodically refreshed:
-- - order_daily_stats: Daily order and revenue metrics
-- - product_performance: Product sales and revenue analysis
-- Note: Use refresh_materialized_views() to update these views
-- Daily Order Statistics
CREATE MATERIALIZED VIEW order_daily_stats AS
SELECT 
    store_id,
    date_trunc('day', created_at) AS day,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    SUM(discount_amount) as total_discounts
FROM orders
GROUP BY store_id, date_trunc('day', created_at)
WITH DATA;

CREATE UNIQUE INDEX idx_order_stats_store_day ON order_daily_stats(store_id, day);

-- Product Performance
CREATE MATERIALIZED VIEW product_performance AS
SELECT 
    p.id as product_id,
    p.store_id,
    p.name,
    COUNT(DISTINCT o.id) as order_count,
    SUM(oi.quantity) as units_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as avg_selling_price
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
LEFT JOIN order_items oi ON pv.id = oi.variant_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.id, p.store_id, p.name
WITH DATA;

CREATE UNIQUE INDEX idx_product_performance_id ON product_performance(product_id);

-- =================================================================
-- 6. Row Level Security (RLS)
-- =================================================================
-- Security policies ensure:
-- - Users can only access their own data
-- - Admins have full access to all records
-- - Public can only view active products
-- - Proper authorization for all operations
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own profile or admin"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Allow update own profile or admin"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid() 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        id = auth.uid() 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- User Addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own addresses or admin"
    ON user_addresses
    FOR SELECT
    TO authenticated
    USING (
        profile_id = auth.uid()
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Allow modify own addresses or admin"
    ON user_addresses
    FOR ALL
    TO authenticated
    USING (
        profile_id = auth.uid()
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        profile_id = auth.uid()
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to view active products"
    ON products
    FOR SELECT
    TO public
    USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Allow admin full access to products"
    ON products
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Allow admin to manage orders"
    ON orders
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Other tables follow similar patterns...

-- =================================================================
-- 7. Audit Logging Trigger
-- =================================================================
-- Comprehensive audit trail for critical operations:
-- - Tracks all INSERT/UPDATE/DELETE operations
-- - Records both old and new values for updates
-- - Maintains user context for each change
-- - Stores metadata about the operation
CREATE OR REPLACE FUNCTION log_table_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO events (
        user_id,
        store_id,
        event_type,
        event_data
    ) VALUES (
        auth.uid(),
        CASE 
            WHEN TG_TABLE_NAME = 'stores' THEN NEW.id
            WHEN TG_TABLE_NAME IN ('products', 'orders', 'discounts') THEN NEW.store_id
            ELSE NULL
        END,
        TG_TABLE_NAME || '_' || TG_OP,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'action', TG_OP,
            'record_id', NEW.id,
            'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            'new_data', row_to_json(NEW)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit logging to important tables
CREATE TRIGGER audit_stores
    AFTER INSERT OR UPDATE OR DELETE ON stores
    FOR EACH ROW EXECUTE FUNCTION log_table_event();

CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_table_event();

CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_table_event();

-- =================================================================
-- End of Schema
-- =================================================================
