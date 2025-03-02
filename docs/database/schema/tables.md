# Table Definitions

## Overview

This document provides detailed information about each table in our database, including their columns, data types, and purposes.

## Core Tables

### Authentication & Users

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

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

## Notes

- All tables include created_at and updated_at timestamps
- Foreign keys use ON DELETE CASCADE where appropriate
- Text fields use appropriate constraints
- Numeric fields include range checks
