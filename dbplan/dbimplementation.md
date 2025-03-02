# **E-commerce Database Implementation Guide**

This document consolidates all the **schema definitions**, **Row-Level Security (RLS) policies**, and **step-by-step tasks** in one place. It is intended for future developers (human or AI) to reference when initializing or reviewing the database layer of our custom e-commerce platform.  

## **Current Progress Status**
Last Updated: 2025-02-22

### Completed Tasks
- Initial documentation and planning
- SQL script preparation (in docs/database/migrations/initial-schema.sql)
- Schema definition (in dbschema.md)
- RLS policies definition (in rlspolicies.md)
- Configure Supabase Project
  - Create/identify Supabase project 
  - Verify admin privileges 
  - Enable pg_stat_statements extension 
  - Enable remaining extensions (citext, uuid-ossp, pgcrypto) 
  - Connection pooling (automatically managed by Supabase via PgBouncer) 
  - Automated backups (managed by Supabase with daily snapshots) 
  - Read replicas (deferred for future if needed) 
- Schema Implementation
   - Execute schema creation script
   - Verify table creation
   - Enable RLS
   - Implement security policies
   - Create performance indexes
   - Set up audit logging
- Backup and recovery procedures
  - Automated daily Supabase backups
  - Custom weekly backup script
  - Backup verification tools
  - Recovery procedures documented

### Verification Results (2025-02-22)
- Database Structure:
  - 18 public tables created and verified
  - 2 materialized views implemented
  - 8 RLS policies configured
  - All required extensions enabled
- Backup System:
  - Automated Supabase backups confirmed
  - Custom backup script created (scripts/backup_db.sh)
  - Backup verification queries tested
  - Recovery procedures documented and tested

### Next Steps 
1. Begin backend development with NestJS
   - Set up NestJS project structure
   - Configure database connection
   - Implement service layer
2. Configure monitoring and alerting
3. Implement database maintenance procedures
4. Set up read replicas (deferred for future if needed)
5. Configure connection pooling
6. Set up S3 bucket for custom backups
7. Configure GPG keys for backup encryption

## **Table of Contents**
1. [Overview & Prerequisites](#overview--prerequisites)  
2. [Tasks Checklist](#tasks-checklist)  
3. [Single SQL Script (Schema + RLS)](#single-sql-script-schema--rls)  
4. [Verification & Testing](#verification--testing)  
5. [Maintenance & Future Steps](#maintenance--future-steps)

---

## **1. Overview & Prerequisites**

1. **Supabase Setup**  
   - We use **Supabase** as our PostgreSQL database provider (and for Auth/Storage).  
   - By default, Supabase includes the `auth.users` table for user credentials.
   - Connection pooling is automatically managed by Supabase using PgBouncer
   - Automated daily backups with retention based on plan level
   - Set up read replicas for analytics queries.

2. **Extensions**  
   - Certain features (e.g., case-insensitive text via `citext`) require enabling the extension.  
   - `citext` for case-insensitive text.
   - `pg_stat_statements` for query analysis.
   - `uuid-ossp` for UUID generation.
   - `pgcrypto` for encryption functions.

3. **Row-Level Security (RLS)**  
   - We enable **RLS** on each table so that customers can only see their own data, admins can see everything, etc.  

4. **Schema Outline**  
   - We have tables for:  
     - **stores** (multi-store support)  
     - **profiles** (extended user info referencing `auth.users`)  
     - **products**, **product_variants**, **inventory_items**, **product_images**  
     - **orders**, **order_items**  
     - **discounts**, **gift_cards**, plus bridging tables for them  
     - **payments**, **refunds**, **shipments** (optional but recommended)  
     - **events** (optional analytics/logging)  

This approach allows us to run **one script** that creates all tables and defines RLS policies in a single pass, as long as **the order respects foreign key references**.

---

## **2. Tasks Checklist**

Below is the recommended order of tasks to follow. You can check off each item as you complete it.

1. **[x] Configure Supabase**  
   1. Create (or identify) your Supabase project.  
   2. Verify you have admin privileges in the Dashboard or CLI.
   3. Enable required extensions.
   4. Connection pooling is automatically managed by Supabase using PgBouncer
   5. Automated daily backups with retention based on plan level
   6. Configure read replicas (if needed).

2. **[ ] Ensure Extensions**  
   1. Enable `citext` (if not already) for case-insensitive fields.  
   2. (Optional) Enable other extensions you may need later.

3. **[x] Execute Single SQL Script**  
   1. Paste the script from [Section 3](#single-sql-script-schema--rls) into the Supabase SQL editor (or use `psql`, etc.).  
   2. Verify all `CREATE TABLE` statements succeed (watch out for foreign key or ordering errors).  
   3. Confirm RLS is enabled and that policies are created.

4. **[ ] Seed/Reference Data**  
   1. Insert at least one row into `stores` (e.g., your main store).  
   2. Create a user in `auth.users` (through Supabase) and a matching row in `profiles`.  
   3. Optionally set `profiles.role='admin'` for your test admin user.

5. **[ ] Verify RLS & Basic Queries**  
   1. Test as an **admin** user. Confirm you can see/modify everything.  
   2. Test as a **normal** user. Confirm you only see your own data (orders, addresses, etc.).  
   3. Check how the public (unauthenticated) can/cannot see `products`.

6. **[ ] Ongoing Maintenance**  
   1. Add or refine indexes based on actual usage.  
   2. Consider triggers or Supabase Edge Functions for concurrency (e.g., auto-updating inventory).  
   3. Monitor and adjust RLS policies if new roles/stores or new features appear.

---

## **3. Single SQL Script (Schema + RLS)**

Below is an **all-in-one** SQL script that:

1. **Creates** or enables the `citext` extension.  
2. **Creates** each table in the correct order.  
3. **Enables** RLS on each table.  
4. **Defines** example RLS policies (for normal customers and admin).  

> **Important**:  
> - This script is a template. If you have a different roles system or you want more refined store-level scoping, adjust the policy logic as needed.  
> - You can remove or comment out any optional tables (`payments`, `refunds`, `events`) if you’re not using them right away.

```sql
/*
===========================================
  1) Extensions
===========================================
*/
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/*
===========================================
  2) Create Tables in Order
===========================================
*/

-- 2.1: stores
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  domain      VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.2: profiles (extends Supabase's auth.users)
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role             VARCHAR(50) NOT NULL DEFAULT 'customer',  -- "admin", "manager", "customer"
  first_name       VARCHAR(100),
  last_name        VARCHAR(100),
  phone_number     VARCHAR(50),
  status           VARCHAR(50) DEFAULT 'active',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.3: user_addresses
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

-- 2.4: products
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  handle           VARCHAR(255) UNIQUE,
  description      TEXT,
  status           VARCHAR(50) DEFAULT 'draft', -- "active", "archived"
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.5: product_variants
CREATE TABLE product_variants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku              VARCHAR(100),
  option_values    JSONB,        -- e.g. { "Size": "M", "Color": "Red" }
  price            NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  weight           NUMERIC(10,2),
  barcode          VARCHAR(100),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.6: inventory_items
CREATE TABLE inventory_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 0,
  reserved    INT NOT NULL DEFAULT 0,
  location_id UUID, -- if multi-warehouse
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.7: product_images
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID,
  image_url   TEXT NOT NULL,
  alt_text    TEXT,
  position    INT DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.8: collections / product_collections
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  handle      VARCHAR(255) UNIQUE,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE product_collections (
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- 2.9: orders
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES auth.users(id),  -- or references profiles(id)
  email               CITEXT NOT NULL,
  status              VARCHAR(50) DEFAULT 'pending',
  currency            VARCHAR(3) DEFAULT 'USD',
  subtotal            NUMERIC(10,2) DEFAULT 0,
  total_discounts     NUMERIC(10,2) DEFAULT 0,
  total_tax           NUMERIC(10,2) DEFAULT 0,
  shipping_cost       NUMERIC(10,2) DEFAULT 0,
  total_price         NUMERIC(10,2) DEFAULT 0,
  payment_method      VARCHAR(50),
  transaction_id      VARCHAR(255),
  shipping_address_id UUID,
  billing_address_id  UUID,
  placed_at           TIMESTAMP WITH TIME ZONE,
  fulfilled_at        TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.10: order_items
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

-- 2.11: discounts / order_discounts
CREATE TABLE discounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code           VARCHAR(100),
  discount_type  VARCHAR(50) NOT NULL, -- "percentage", "fixed_amount"
  value          NUMERIC(10,2) NOT NULL,
  usage_limit    INT,
  used_count     INT DEFAULT 0,
  min_subtotal   NUMERIC(10,2),
  start_date     TIMESTAMP WITH TIME ZONE,
  end_date       TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_discounts (
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_id    UUID NOT NULL REFERENCES discounts(id),
  amount_applied NUMERIC(10,2) NOT NULL,
  PRIMARY KEY(order_id, discount_id)
);

-- 2.12: gift_cards
CREATE TABLE gift_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code             VARCHAR(100) UNIQUE NOT NULL,
  initial_value    NUMERIC(10,2) NOT NULL,
  remaining_value  NUMERIC(10,2) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at       TIMESTAMP WITH TIME ZONE
);

-- 2.13: payments / refunds (optional)
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL,
  transaction_id  VARCHAR(255),
  amount          NUMERIC(10,2) NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE refunds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount       NUMERIC(10,2) NOT NULL,
  reason       VARCHAR(255),
  status       VARCHAR(50) DEFAULT 'initiated',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.14: shipments
CREATE TABLE shipments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_provider VARCHAR(50),
  tracking_number   VARCHAR(100),
  status            VARCHAR(50) DEFAULT 'pending',
  label_url         TEXT,
  cost              NUMERIC(10,2),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.15: events (optional analytics/logging)
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  store_id    UUID REFERENCES stores(id),
  event_type  VARCHAR(100),
  event_data  JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

/*
===========================================
  3) Enable RLS on Each Table
===========================================
*/
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
-- (You can enable RLS on other tables like product_variants, inventory_items, 
--  etc., if you want more fine-grained control.)

/*
===========================================
  4) Example RLS Policies
     (Adapt as needed!)
===========================================
*/

-- Example: profiles - let a user see/update only their row; admin sees all.
CREATE POLICY "Select own profile or admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Update own profile or admin"
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

-- Example: user_addresses - only owner or admin can read/update
CREATE POLICY "Select own addresses or admin"
  ON user_addresses
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Update own addresses or admin"
  ON user_addresses
  FOR UPDATE
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Example: products - public can only see active, admin sees all
CREATE POLICY "Public can see active products"
  ON products
  FOR SELECT
  TO public
  USING ( status = 'active' );

CREATE POLICY "Admin can see all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- (Similarly, define insert/update/delete for admins, if needed.)

-- Example: orders - user can see only own orders, admin sees all
CREATE POLICY "Select own orders or admin"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

CREATE POLICY "Admin update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

/*
  Repeat policy creation for order_items, discounts, gift_cards, etc.
  Adapt them to match your actual logic for each table.
*/
```

> **Tip**: If you want to **wrap everything** in a single **transaction**, you can add:
> ```sql
> BEGIN;
>   -- entire script here
> COMMIT;
> ```
> This way, if a statement fails, the entire set of changes is rolled back.

---

## **4. Verification & Testing**

1. **Schema Inspection**  
   - After running the script, check the Supabase Dashboard → “Database” → “Tables” to confirm they match.

2. **RLS Validation**  
   - Log in as an **admin** user (`role = 'admin'`) and confirm you can see all data in each table.  
   - Log in as a **normal** user and confirm you can only see your `profile`, your `orders`, your `addresses`, etc.  
   - If your policies allow `public` to see active products, test that with a **non-authenticated** session.

3. **Insert Demo Data**  
   - Add a row to `stores` (e.g. “Main Store”).  
   - Insert test products, with some in `status = 'active'` and others in `draft`. Confirm that public users only see the active ones.  
   - Insert an order under your test user. Verify that user sees it, while other users cannot.

4. **Edge Cases**  
   - Attempt to update an order that’s not yours (should fail if not admin).  
   - Attempt to see a “draft” product as a public user (should fail or return nothing).  

---

## **5. Maintenance & Future Steps**

1. **Regular Maintenance**
   - Schedule VACUUM ANALYZE.
   - Refresh materialized views.
   - Monitor and adjust connection pools.
   - Analyze and optimize slow queries.

2. **Performance Monitoring**
   - Track query execution times.
   - Monitor index usage.
   - Analyze cache hit ratios.
   - Check table bloat.

3. **Security Audits**
   - Review RLS policies.
   - Check audit logs.
   - Monitor rate limits.
   - Verify backup integrity.

4. **Scaling Considerations**
   - Implement table partitioning.
   - Add read replicas.
   - Configure connection pooling.
   - Optimize query patterns.

5. **Backup Strategy**
   - Daily full backups.
   - Point-in-time recovery.
   - Regular restore testing.
   - Backup encryption.

---

## **Conclusion**

This single document provides everything you need to **set up** your e-commerce database, **enforce** RLS security, and **test** basic data flows. By following the **Tasks Checklist** and the **Single SQL Script**, your database will be initialized in a secure and organized manner.  

If you need more fine-grained logic (like store managers vs. global admins, or advanced concurrency triggers), extend these examples accordingly. This plan will serve as a robust foundation for your custom e-commerce platform running on **Supabase**.  

**Happy Building!**