# Database Schema

## Overview

Our database schema is designed to support a multi-store e-commerce platform with comprehensive product management, order processing, and customer relationship features. The schema leverages Supabase's built-in authentication and storage capabilities.

## Core Tables

### Authentication & Users
- `auth.users` (Supabase managed)
- `public.profiles`
- `public.roles`
- `public.permissions`

### Store Management
- `public.stores`
- `public.store_settings`
- `public.staff`
- `public.staff_permissions`

### Products
- `public.products`
- `public.product_variants`
- `public.product_images`
- `public.categories`
- `public.inventory_items`
- `public.price_lists`

### Orders
- `public.orders`
- `public.order_items`
- `public.order_status`
- `public.shipping_methods`
- `public.payment_methods`

### Customers
- `public.customers`
- `public.addresses`
- `public.wishlists`
- `public.customer_groups`

### Marketing
- `public.discounts`
- `public.gift_cards`
- `public.promotions`
- `public.coupons`

## Schema Details

For detailed information about each table, including columns, constraints, and relationships, see:
- [Table Definitions](./tables.md)
- [Relationships](./relationships.md)
- [Indexes](./indexes.md)
- [Constraints](./constraints.md)

## Entity Relationship Diagram

See our [ER Diagram](./diagram.md) for a visual representation of the database structure.

## Schema Migrations

For information about schema changes and migrations, see our [Migration Guide](../migrations/guide.md).
