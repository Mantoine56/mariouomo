# Mario Uomo Database Migration Plan

This document outlines the step-by-step process to update the database schema to match the entity definitions in the backend code.

## Overview of Changes

### Profiles Table
- Add `full_name` column
- Add `email` column
- Add `phone` column (entity uses `phone` but DB has `phone_number`)
- Add `preferences` column (JSONB)

### Inventory Items Table
- Add `deleted_at` column (for soft delete functionality)
- Add `location` column
- Rename `reserved` column to `reserved_quantity`
- Add `reorder_point` column
- Add `reorder_quantity` column
- Add `version` column (for optimistic locking)
- Add `last_counted_at` column
- Add `metadata` column (JSONB)

## Migration Process

### 1. Backup the Database
Before making any changes, create a backup of the database:

```sql
-- Run this in Supabase SQL Editor
SELECT pg_dump_table('profiles');
SELECT pg_dump_table('inventory_items');
```

### 2. Apply Profile Table Changes
Run the `fix-profiles-table.sql` script in the Supabase SQL Editor.

### 3. Apply Inventory Items Table Changes
Run the `fix-inventory-items-table.sql` script in the Supabase SQL Editor.

### 4. Verify Schema Changes
After applying the changes, verify that the schema matches the entity definitions:

```sql
-- Verify profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Verify inventory_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'inventory_items';
```

### 5. Test Backend Functionality
After applying the schema changes, test the backend functionality to ensure it works correctly with the updated schema:

1. Start the backend server
2. Test authentication endpoints
3. Test profile-related endpoints
4. Test inventory-related endpoints

## Rollback Plan

If any issues occur during the migration, use the following rollback plan:

1. Restore the database from the backup
2. Revert the code changes in the backend

## Post-Migration Tasks

After successfully migrating the database schema:

1. Update the backend-fixes.md document to mark completed tasks
2. Document any remaining issues or tasks
3. Update the entity definitions if needed to ensure they match the actual database schema
