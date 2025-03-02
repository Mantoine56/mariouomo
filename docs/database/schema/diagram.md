# Database Schema Diagram

## Overview

This document provides a visual representation of our database schema using Mermaid diagrams.

## Core Schema

```mermaid
erDiagram
    stores ||--o{ products : has
    stores ||--o{ staff : employs
    stores ||--o{ orders : receives
    
    products ||--o{ product_variants : contains
    products ||--o{ product_images : has
    products }o--o{ categories : belongs_to
    
    product_variants ||--o{ inventory_items : tracks
    product_variants ||--o{ order_items : included_in
    
    orders ||--o{ order_items : contains
    orders ||--|| customers : placed_by
    orders }o--|| shipping_methods : uses
    orders }o--|| payment_methods : uses
    
    customers ||--o{ orders : places
    customers ||--o{ addresses : has
    customers }o--o{ customer_groups : belongs_to
    
    discounts }o--o{ orders : applied_to
    gift_cards }o--o{ orders : redeemed_in
```

## Authentication Schema

```mermaid
erDiagram
    auth_users ||--|| profiles : has
    profiles }o--|| roles : assigned
    roles ||--o{ permissions : contains
    staff }o--o{ permissions : has
```

## Marketing Schema

```mermaid
erDiagram
    promotions ||--o{ discounts : creates
    discounts }o--o{ products : applies_to
    gift_cards ||--o{ gift_card_transactions : has
    coupons }o--|| discounts : generates
```

## Table Details

For detailed information about each table, including columns and constraints, see:
- [Table Definitions](./tables.md)
- [Relationships](./relationships.md)

## Notes

- All tables include created_at and updated_at timestamps
- Foreign keys use appropriate ON DELETE rules
- Tables implement Row Level Security
- Proper indexing on frequently queried columns
