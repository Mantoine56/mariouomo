# March 2025 Schema Updates

## Overview

This document details the database schema changes implemented in March 2025 to align the database structure with the entity definitions in the backend code. These changes focus on backward compatibility while adding new functionality.

## Migration Summary

### Profiles Table Updates
Added missing columns to support both legacy and new field names:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferences JSONB;
```

Data migration to populate new columns from existing data:

```sql
-- Set full_name from first_name and last_name
UPDATE profiles 
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL AND first_name IS NOT NULL;

-- Set email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Set phone from phone_number
UPDATE profiles
SET phone = phone_number
WHERE phone IS NULL AND phone_number IS NOT NULL;
```

### Inventory Items Table Updates
Added new columns and renamed existing ones to match entity definition:

```sql
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Rename reserved column to reserved_quantity
ALTER TABLE inventory_items RENAME COLUMN reserved TO reserved_quantity;
```

## Backward Compatibility

These schema changes were designed to maintain backward compatibility:

1. **Dual Field Support**: Both old and new field names are supported during the transition period
2. **Data Migration**: Existing data is copied to new fields automatically
3. **Default Values**: Sensible defaults are provided for new columns
4. **No Constraints**: No new NOT NULL constraints were added to existing records

## Backend Adaptations

The backend code has been updated to:

1. Support both legacy and new column names
2. Implement field mapping strategies
3. Add compatibility layers in entity definitions
4. Update services to handle schema variations
5. Fix TypeScript compilation errors in entity definitions
6. Update mock objects in tests to match entity requirements

## Verification

After applying these migrations, the following verification steps were performed:

1. Endpoint testing with test-endpoints.sh script
2. Manual data verification
3. Backend service compatibility testing
4. TypeScript compilation verification
5. Unit test validation across all modules

## Entity Updates

The following entity updates were made to align with the database schema:

### ProductVariant Entity
- Added missing `name` property

### Order Entity
- Updated property names to match database:
  - `subtotal_amount` (replacing `subtotal`)
  - `tax_amount` (replacing `tax`)
  - `shipping_amount` (replacing `shipping`)
  - Added `discount_amount` property
  - Added required `store_id` property

### Repository Pattern
- Updated BaseRepository to use composition instead of inheritance
- Removed deprecated `@EntityRepository` decorator
- Updated repository initialization in modules

## Implementation Date

These schema and code changes were implemented on March 6-7, 2025.
