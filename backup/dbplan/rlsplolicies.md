Below is an **example** SQL script that configures **Row-Level Security (RLS)** policies for the tables described in **dbschema2.md**, using **Supabase** conventions. Real-world implementations will differ based on your exact requirements (for instance, how you handle admin vs. store manager roles). This script illustrates common patterns:

1. **Enable RLS** on each table.  
2. **Allow** each “record owner” to view/update their rows.  
3. **Allow** an “admin” role (stored in the `profiles` table) to see or modify everything.  
4. (Optional) **Allow** the public (unauthenticated users) to view certain tables (e.g., active products) if desired.  

You can modify or extend these policies for store‐manager roles, additional logic (like multi-store scoping), or more nuanced access rules.

> **Important Notes**  
> - This assumes you store user roles in `profiles.role`, with `'admin'` for administrators.  
> - By default, Supabase sets the JWT claim `auth.uid()` to the current user’s `auth.users.id`.  
> - In the examples, we’ll frequently check `id = auth.uid()` or `user_id = auth.uid()` and also check for `profiles.role = 'admin'`.  
> - Some of these policies use subqueries like `(SELECT role FROM profiles WHERE id = auth.uid())`. An alternative approach is to [populate JWT claims](https://supabase.com/docs/guides/auth#jwt-and-features) with the user’s role, but we’ll keep it simple here.  
> - Policies for `INSERT`/`UPDATE` typically also require a `WITH CHECK` condition.  
> - Where the user is not strictly required to be logged in, you could replace `TO authenticated` with `TO public`.  
> - RLS policies are evaluated in order, and multiple policies can apply. Ensure you test thoroughly.

---

## 1. Profiles Table

**Goal**:  
- Let each user see and update their own profile.  
- Let admins see and update everyone’s profiles.  
- Typically, you wouldn’t allow inserts on `profiles` directly because new rows are created automatically when a new user signs up, but you can adjust if needed.

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow the record owner OR an admin to SELECT this row
CREATE POLICY "Allow select own profile or admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Allow the record owner OR an admin to UPDATE this row
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

-- (Optional) If you want admins to DELETE profiles
CREATE POLICY "Allow admin to delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## 2. User Addresses

**Goal**:  
- A user should see and modify only their own addresses.  
- An admin can see/modify all addresses.

```sql
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

CREATE POLICY "Allow delete own addresses or admin"
  ON user_addresses
  FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## 3. Products

**Goal**:  
- Public or “authenticated” users can read **active** products (i.e., `status = 'active'`).  
- Admin can read all products (including draft or archived).  
- Admin can create/update/delete as needed.

You might have a separate “manager” or “owner” role that can do the same, but this shows the general idea.

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3a. Public (unauthenticated) can see active products only
--     If you want guests to view products, use `TO public`.
CREATE POLICY "Allow public to select active products"
  ON products
  FOR SELECT
  TO public
  USING (
    status = 'active'
  );

-- 3b. Admin can see all products (regardless of status)
CREATE POLICY "Allow admin to select all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    -- no extra 'OR' needed because the previous policy handles non-admins for active ones
  );

-- 3c. Admin can create new products
CREATE POLICY "Allow admin to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3d. Admin can update or delete products
CREATE POLICY "Allow admin to update or delete products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

> **Note**: This example demonstrates how to allow “public” read access to active products only. If you want to require authentication for all product reads, change `TO public` to `TO authenticated`.

---

## 4. Orders

**Goal**:  
- Customers see only their own orders.  
- Admin sees all orders.  
- Customers can **insert** orders (i.e., place an order).  
- Typically, only admins or internal staff can update orders (e.g., change status) or delete them.

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4a. Let each customer or admin SELECT relevant orders
CREATE POLICY "Allow select own orders or admin"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4b. Let a customer insert their own new order
CREATE POLICY "Allow insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL  -- if you allow guest checkout, you might store user_id as null
  );

-- 4c. Let only admins update or delete orders
CREATE POLICY "Allow admin to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## 5. Order Items

Similar to **orders**, typically:
- A customer can view their own order items.
- An admin can view all order items.
- Inserts happen when an order is placed, so typically the same logic as orders.

```sql
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own order_items or admin"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    -- user must own the parent order
    (order_id IN (
      SELECT id FROM orders 
      WHERE user_id = auth.uid()
    ))
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Insert order_items with own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (order_id IN (
      SELECT id FROM orders 
      WHERE user_id = auth.uid()
    ))
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to update or delete order_items"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to delete order_items"
  ON order_items
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## 6. Discounts, Gift Cards, Payments, Etc.

You can apply a similar pattern to your other tables:

- **Discounts / Gift Cards**  
  Typically only admins or store managers can create, update, or delete discount codes/gift cards. Customers only “apply” them to their orders, but do not read them directly.  
- **Payments / Refunds**  
  Generally controlled by admin or system processes.  
- **Shipments**  
  Typically only admins or staff can create shipments. A customer can see shipments if they belong to the user’s order.

Below is a simplified example for the `discounts` table. You could adapt it for `gift_cards`, `payments`, `refunds`, etc.

```sql
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin to select discounts"
  ON discounts
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to insert discounts"
  ON discounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to update discounts"
  ON discounts
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admin to delete discounts"
  ON discounts
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

If you want customers to *apply* discount codes, you usually do that through server-side logic—customers never directly read or write the `discounts` table. The NestJS (or other server) code checks the discount code, updates `order_discounts`, and so on.

---

## 7. Enabling RLS & Testing

You must enable RLS on each table **before** your policies take effect:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
...
```
(We did this in each snippet above.)

**After** you create these policies, test thoroughly:
1. **Admin user**: Should be able to access everything as intended.  
2. **Non‐admin user**: Should only see or modify their own data.  
3. **Public (unauthenticated)**: Should see only public endpoints/tables you explicitly allow.  

You can also define separate policies for `INSERT`, `SELECT`, `UPDATE`, and `DELETE`, or sometimes combine them if the `USING` and `WITH CHECK` conditions are the same.

---

## 8. Summary

This example demonstrates how to write basic RLS policies in Supabase for a typical e-commerce scenario:
- **Owner**/**admin** can manage everything.  
- **Each user** can only see or modify their own profile, addresses, and orders.  
- **Public** (if desired) can see active products or any “public” data.  

Tailor these policies to your actual roles, multi-store logic (e.g., store managers can only see data for their `store_id`), and any unique business needs. Once you confirm your policies are correct, your Supabase project will enforce these rules at the database level, regardless of how a user tries to query the data.