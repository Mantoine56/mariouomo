# Table Definitions

## Overview

This document provides detailed information about each table in our database, including their columns, data types, and purposes.

## Core Tables

### Authentication & Users

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    -- New columns added in March 2025 migration
    full_name TEXT,
    email TEXT,
    phone TEXT,
    preferences JSONB,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Note:** The `profiles` table now supports both legacy column names (`first_name`, `last_name`, `phone_number`) and new column names (`full_name`, `email`, `phone`, `preferences`) for backward compatibility during the transition period.

#### roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

[Additional table definitions from ../migrations/initial-schema.sql...]

## Table Relationships

### One-to-Many Relationships
- profiles -> orders
- stores -> products
- products -> variants
- orders -> order_items

### Many-to-Many Relationships
- products <-> categories
- customers <-> addresses
- orders <-> discounts

## Indexes

Each table includes appropriate indexes for:
- Primary keys
- Foreign keys
- Frequently queried columns
- Full-text search columns

### inventory_items
```sql
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES variants(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- Renamed from 'reserved'
    -- New columns added in March 2025 migration
    deleted_at TIMESTAMPTZ,
    location VARCHAR(255),
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    last_counted_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Note:** The `inventory_items` table has been enhanced with additional columns to support inventory management features like reordering, location tracking, and soft delete functionality.

## Notes

- All tables include created_at and updated_at timestamps
- Foreign keys use ON DELETE CASCADE where appropriate
- Text fields use appropriate constraints
- Numeric fields include range checks
- JSONB fields are used for flexible schema extensions (preferences, metadata)
