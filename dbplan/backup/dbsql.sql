-- Add extensions for advanced features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- for query analysis

-- Create audit function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================
-- 1. Stores
-- =============================
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  domain      VARCHAR(255),
  metadata    JSONB DEFAULT '{}',  -- for extensible properties
  deleted_at  TIMESTAMP WITH TIME ZONE,  -- for soft deletes
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================
-- 2. Profiles (extends Supabase auth.users)
-- Note: "auth.users" already exists in Supabase.
-- =============================
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role             VARCHAR(50) NOT NULL DEFAULT 'customer',  -- "owner", "manager", "customer"
  first_name       VARCHAR(100),
  last_name        VARCHAR(100),
  phone_number     VARCHAR(50),
  status           VARCHAR(50) DEFAULT 'active',  -- e.g. "active", "banned"
  metadata         JSONB DEFAULT '{}',
  deleted_at       TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- =============================
-- 3. User Addresses
-- =============================
CREATE TABLE user_addresses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address_type     VARCHAR(50) DEFAULT 'shipping', -- or "billing"
  line1            VARCHAR(255),
  line2            VARCHAR(255),
  city             VARCHAR(100),
  state            VARCHAR(100),
  postal_code      VARCHAR(20),
  country          VARCHAR(100),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 4. Products
-- =============================
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  handle           VARCHAR(255) UNIQUE,
  description      TEXT,
  status           VARCHAR(50) DEFAULT 'draft', -- "active", "archived", etc.
  metadata         JSONB DEFAULT '{}',
  search_vector    tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED,
  deleted_at       TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for common queries and search
CREATE INDEX idx_products_store_status ON products(store_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_handle ON products(handle) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- =============================
-- 5. Product Variants
-- =============================
CREATE TABLE product_variants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku                VARCHAR(100),
  option_values      JSONB,                -- e.g. { "Size": "M", "Color": "Red" }
  price              NUMERIC(10,2),
  compare_at_price   NUMERIC(10,2),
  weight             NUMERIC(10,2),
  barcode            VARCHAR(100),
  metadata           JSONB DEFAULT '{}',
  deleted_at         TIMESTAMP WITH TIME ZONE,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX idx_variants_sku ON product_variants(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_variants_price ON product_variants(price);

-- =============================
-- 6. Inventory Items
-- =============================
CREATE TABLE inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id     UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity       INT NOT NULL DEFAULT 0,
  reserved       INT NOT NULL DEFAULT 0,
  location_id    UUID,  -- references a "locations" table if you have multi-warehouse
  metadata       JSONB DEFAULT '{}',
  version        INT DEFAULT 1,  -- for optimistic locking
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_inventory_variant ON inventory_items(variant_id);
CREATE INDEX idx_inventory_quantity ON inventory_items(quantity) WHERE quantity <= 5;  -- low stock alerts

-- Add audit trigger for inventory changes
CREATE TABLE inventory_audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id   UUID REFERENCES inventory_items(id),
  old_quantity   INT,
  new_quantity   INT,
  old_reserved   INT,
  new_reserved   INT,
  changed_by     UUID REFERENCES auth.users(id),
  changed_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 7. Product Images
-- =============================
CREATE TABLE product_images (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id     UUID,         -- if you want an image specific to a variant
  image_url      TEXT NOT NULL,  -- points to Supabase Storage or external URL
  alt_text       TEXT,
  position       INT DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 8. Collections & Linking Table
-- =============================
CREATE TABLE collections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  handle         VARCHAR(255) UNIQUE,
  description    TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE product_collections (
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id  UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- =============================
-- 9. Orders
-- =============================
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES auth.users(id),  -- or references profiles(id)
  email               CITEXT NOT NULL,     -- capturing email for the order
  status              VARCHAR(50) DEFAULT 'pending',
  currency            VARCHAR(3) DEFAULT 'USD',
  subtotal            NUMERIC(10,2) DEFAULT 0,
  total_discounts     NUMERIC(10,2) DEFAULT 0,
  total_tax           NUMERIC(10,2) DEFAULT 0,
  shipping_cost       NUMERIC(10,2) DEFAULT 0,
  total_price         NUMERIC(10,2) DEFAULT 0,
  payment_method      VARCHAR(50),         -- "stripe", "paypal", etc.
  transaction_id      VARCHAR(255),        -- from Stripe or aggregator
  shipping_address_id UUID,                -- references user_addresses, if you want
  billing_address_id  UUID,
  metadata            JSONB DEFAULT '{}',
  placed_at           TIMESTAMP WITH TIME ZONE,
  fulfilled_at        TIMESTAMP WITH TIME ZONE,
  deleted_at          TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);

-- Add materialized view for order analytics
CREATE MATERIALIZED VIEW order_daily_stats AS
SELECT 
  store_id,
  date_trunc('day', created_at) as order_date,
  count(*) as total_orders,
  sum(total_price) as total_revenue,
  avg(total_price) as avg_order_value
FROM orders
WHERE deleted_at IS NULL
GROUP BY store_id, date_trunc('day', created_at);

CREATE UNIQUE INDEX idx_order_daily_stats ON order_daily_stats(store_id, order_date);

-- =============================
-- 10. Order Items
-- =============================
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id  UUID NOT NULL REFERENCES product_variants(id),
  sku         VARCHAR(100),
  title       VARCHAR(255),
  quantity    INT NOT NULL DEFAULT 1,
  price       NUMERIC(10,2) NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 11. Discounts
-- =============================
CREATE TABLE discounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code           VARCHAR(100),    -- e.g. "SUMMER2025"
  discount_type  VARCHAR(50) NOT NULL,  -- "percentage", "fixed_amount"
  value          NUMERIC(10,2) NOT NULL,
  usage_limit    INT,
  used_count     INT DEFAULT 0,
  min_subtotal   NUMERIC(10,2),
  start_date     TIMESTAMP WITH TIME ZONE,
  end_date       TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optionally add a unique index on code:
-- CREATE UNIQUE INDEX discounts_code_idx ON discounts(code);

-- =============================
-- 12. Order Discounts (link table)
-- =============================
CREATE TABLE order_discounts (
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_id    UUID NOT NULL REFERENCES discounts(id),
  amount_applied NUMERIC(10,2) NOT NULL,
  PRIMARY KEY(order_id, discount_id)
);

-- =============================
-- 13. Gift Cards
-- =============================
CREATE TABLE gift_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code             VARCHAR(100) UNIQUE NOT NULL, -- e.g. "GFT-ABCDE123"
  initial_value    NUMERIC(10,2) NOT NULL,
  remaining_value  NUMERIC(10,2) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at       TIMESTAMP WITH TIME ZONE
);

-- =============================
-- 14. Payments (Optional)
-- =============================
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL,   -- "stripe", "paypal", etc.
  transaction_id  VARCHAR(255),
  amount          NUMERIC(10,2) NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 15. Refunds (Optional)
-- =============================
CREATE TABLE refunds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount       NUMERIC(10,2) NOT NULL,
  reason       VARCHAR(255),
  status       VARCHAR(50) DEFAULT 'initiated',  -- "approved", "completed", etc.
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 16. Shipments
-- =============================
CREATE TABLE shipments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_provider VARCHAR(50),     -- "Shippo", "EasyPost"
  tracking_number   VARCHAR(100),
  status            VARCHAR(50) DEFAULT 'pending',  -- "in_transit", "delivered"
  label_url         TEXT,
  cost              NUMERIC(10,2),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- 17. Events/Logs (Optional)
-- For large-scale analytics, consider an external system.
-- =============================
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  store_id    UUID REFERENCES stores(id),
  event_type  VARCHAR(100),
  event_data  JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY order_daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Add rate limiting table
CREATE TABLE rate_limits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint   VARCHAR(255) NOT NULL,
  hits       INT DEFAULT 1,
  reset_at   TIMESTAMP WITH TIME ZONE DEFAULT now() + interval '1 hour',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address, endpoint);

-- Add session storage table (if not using Redis)
CREATE TABLE sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id),
  data         JSONB NOT NULL,
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

-- =============================
-- End of Schema
-- =============================

-- NOTE ON RLS (Row-Level Security):
-- In Supabase, you enable RLS:
--    ALTER TABLE some_table ENABLE ROW LEVEL SECURITY;
-- Then add policies, e.g.:
--    CREATE POLICY "Customers can view own orders"
--      ON orders
--      FOR SELECT
--      TO public
--      USING ( auth.uid() = user_id );
--
-- Adapt roles (e.g. 'admin') in your 'profiles.role' to allow broader access.
