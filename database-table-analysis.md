# Database Table Analysis

## Active Tables in Codebase

Based on an analysis of entity usage in the codebase, here are the tables that are actively used:

### Core Business Logic Tables

These tables represent the core business model and should exist in both test and production environments:

| Table Name | Entity File | Usage | Status |
|------------|-------------|-------|--------|
| `products` | `products/entities/product.entity.ts` | Products, catalog management | Active in code |
| `product_variants` | `products/entities/product-variant.entity.ts` | Product variations (sizes, colors, etc.) | Active in code |
| `product_images` | `products/entities/product-image.entity.ts` | Product images/media | Active in code |
| `categories` | `products/entities/category.entity.ts` | Product categorization | Active in code |
| `categories_closure` | Generated from `@Tree()` in category entity | Hierarchical category structure | Active in code |
| `inventory_items` | `inventory/entities/inventory-item.entity.ts` | Inventory tracking | Active in code |
| `orders` | `orders/entities/order.entity.ts` | Customer orders | Active in code |
| `order_items` | `orders/entities/order-item.entity.ts` | Items within orders | Active in code |
| `stores` | `stores/entities/store.entity.ts` | Store information | Active in code |
| `profiles` | `users/entities/profile.entity.ts` | User profiles | Active in code |
| `addresses` | `users/entities/address.entity.ts` | User addresses | Active in code |
| `user_addresses` | `users/entities/user-address.entity.ts` | User-address relationships | Active in code |
| `payments` | `payments/entities/payment.entity.ts` | Payment records | Active in code |
| `shipments` | `shipments/entities/shipment.entity.ts` | Shipping records | Active in code |
| `discounts` | `discounts/entities/discount.entity.ts` | Discount codes and rules | Active in code |
| `gift_cards` | `gift-cards/entities/gift-card.entity.ts` | Gift card records | Active in code |
| `events` | `events/entities/event.entity.ts` | System events tracking | Active in code |
| `shopping_carts` | `carts/entities/shopping-cart.entity.ts` | Shopping carts | Active in code |
| `cart_items` | `carts/entities/cart-item.entity.ts` | Items in shopping carts | Active in code |

### Analytics Tables

These tables are used for reporting and analytics:

| Table Name | Entity File | Usage | Status |
|------------|-------------|-------|--------|
| `sales_metrics` | `analytics/entities/sales-metrics.entity.ts` | Sales performance data | Active in code |
| `inventory_metrics` | `analytics/entities/inventory-metrics.entity.ts` | Inventory performance data | Active in code |
| `customer_metrics` | `analytics/entities/customer-metrics.entity.ts` | Customer behavior data | Active in code |
| `real_time_metrics` | `analytics/entities/real-time-metrics.entity.ts` | Real-time dashboard data | Active in code |

### Junction/Relationship Tables

These tables implement many-to-many relationships:

| Table Name | Associated Entity | Usage | Status |
|------------|------------------|-------|--------|
| `product_categories` | `Product` and `Category` | Junction table for product categorization | Implicitly created |
| `discount_products` | `Discount` and `Product` | Products eligible for discounts | Implicitly created |
| `discount_stores` | `Discount` and `Store` | Stores where discounts apply | Implicitly created |

## Specialized Tables

These tables have special purposes:

| Table Name | Purpose | Usage | Status |
|------------|---------|-------|--------|
| `sessions` | User session management | Auth flow | Might be handled by Supabase |
| `rate_limits` | API rate limiting | Security | Utility table |
| `refunds` | Refund records | Order processing | Should be connected to orders |
| `product_views` | Product view analytics | Analytics | Used for tracking |

## Unused or Duplicate Tables

Tables that don't appear to be actively used:

| Table Name | Status | Recommendation |
|------------|--------|----------------|
| All `test_*` tables | Test data | Move to separate test database |

## Test vs. Production Needs

### Tables Needed in Production Only

- `sessions` (if not managed by Supabase)
- `rate_limits`

### Tables Needed in Both Environments

All core business logic tables should exist in both environments for proper testing.

### Tables Needed in Test Environment Only

None - all test tables should mirror production tables, but with separate databases.

## Recommendation

1. **Create a complete schema** based on the entities defined in your codebase
2. **Use this schema for both environments** (test and production)
3. **Remove prefix-based approach** and create a separate test database
4. **Clean up unused tables** after verification

## Entity Relationship Overview

Based on imports and relationships in the code, the following core connections exist:

- Products → Stores (Many-to-One)
- Products → ProductVariants (One-to-Many)
- Products → ProductImages (One-to-Many)
- Products ↔ Categories (Many-to-Many)
- ProductVariants → InventoryItems (One-to-Many)
- Orders → OrderItems (One-to-Many)
- Orders → Profiles (Many-to-One)
- Orders → Shipments (One-to-Many)
- Orders → Payments (One-to-Many)
- Profiles → Addresses (Many-to-Many via UserAddresses)
- ShoppingCarts → CartItems (One-to-Many)

## Next Steps

1. Create a proper migration script that establishes all required tables based on entity definitions
2. Set up a separate test database with the same schema
3. Remove the table prefix approach in test utilities
4. Clean up unused tables in production 