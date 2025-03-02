# Database Relationships

## Overview

This document outlines the relationships between tables in our database, including foreign key constraints and their purposes.

## Core Relationships

### Store Management
```mermaid
erDiagram
    stores ||--o{ products : "has many"
    stores ||--o{ staff : "employs"
    stores ||--o{ orders : "receives"
    stores ||--o{ inventory_items : "stocks"
```

### Product Management
```mermaid
erDiagram
    products ||--o{ product_variants : "has many"
    products ||--o{ product_images : "has many"
    products }o--o{ categories : "belongs to"
    product_variants ||--o{ inventory_items : "tracks"
```

### Order Processing
```mermaid
erDiagram
    orders ||--o{ order_items : "contains"
    orders ||--|| customers : "placed by"
    orders }o--|| shipping_methods : "uses"
    orders }o--|| payment_methods : "uses"
```

### Customer Management
```mermaid
erDiagram
    customers ||--o{ orders : "places"
    customers ||--o{ addresses : "has"
    customers }o--o{ customer_groups : "belongs to"
```

## Relationship Details

### Foreign Key Constraints

#### Products Table
```sql
ALTER TABLE products
    ADD CONSTRAINT fk_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE;
```

[Additional constraints from ../migrations/initial-schema.sql...]

## Data Integrity

### Cascade Rules
- Product deletion cascades to variants and images
- Store deletion cascades to products and inventory
- Order deletion cascades to order items

### Constraints
- Prevent orphaned records
- Maintain referential integrity
- Enforce business rules

## Performance Considerations

### Indexing Strategy
- Foreign key columns are indexed
- Frequently joined columns have appropriate indexes
- Composite indexes for common queries

### Query Optimization
- Join order considerations
- Index usage in complex queries
- Performance impact of cascading deletes
