-- Verification script for database schema changes
-- Run this after applying the migration scripts to verify the changes

-- Verify profiles table structure
SELECT 
    'Profiles Table Structure' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'full_name'
        ) THEN 'PASS: full_name column exists'
        ELSE 'FAIL: full_name column missing'
    END as full_name_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'email'
        ) THEN 'PASS: email column exists'
        ELSE 'FAIL: email column missing'
    END as email_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'phone'
        ) THEN 'PASS: phone column exists'
        ELSE 'FAIL: phone column missing'
    END as phone_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'preferences'
        ) THEN 'PASS: preferences column exists'
        ELSE 'FAIL: preferences column missing'
    END as preferences_check;

-- Verify inventory_items table structure
SELECT 
    'Inventory Items Table Structure' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory_items'
            AND column_name = 'deleted_at'
        ) THEN 'PASS: deleted_at column exists'
        ELSE 'FAIL: deleted_at column missing'
    END as deleted_at_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory_items'
            AND column_name = 'location'
        ) THEN 'PASS: location column exists'
        ELSE 'FAIL: location column missing'
    END as location_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory_items'
            AND column_name = 'reserved_quantity'
        ) THEN 'PASS: reserved_quantity column exists'
        ELSE 'FAIL: reserved_quantity column missing'
    END as reserved_quantity_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory_items'
            AND column_name = 'reorder_point'
        ) THEN 'PASS: reorder_point column exists'
        ELSE 'FAIL: reorder_point column missing'
    END as reorder_point_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory_items'
            AND column_name = 'metadata'
        ) THEN 'PASS: metadata column exists'
        ELSE 'FAIL: metadata column missing'
    END as metadata_check;

-- Check for missing columns in profiles
SELECT 
    'Missing Columns in Profiles' as check_name,
    string_agg(column_name, ', ') as missing_columns
FROM (
    SELECT 'full_name' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'full_name'
    )
    UNION ALL
    SELECT 'email' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'email'
    )
    UNION ALL
    SELECT 'phone' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'phone'
    )
    UNION ALL
    SELECT 'preferences' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'preferences'
    )
) as missing;

-- Check for missing columns in inventory_items
SELECT 
    'Missing Columns in Inventory Items' as check_name,
    string_agg(column_name, ', ') as missing_columns
FROM (
    SELECT 'deleted_at' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'deleted_at'
    )
    UNION ALL
    SELECT 'location' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'location'
    )
    UNION ALL
    SELECT 'reserved_quantity' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'reserved_quantity'
    )
    UNION ALL
    SELECT 'reorder_point' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'reorder_point'
    )
    UNION ALL
    SELECT 'reorder_quantity' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'reorder_quantity'
    )
    UNION ALL
    SELECT 'version' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'version'
    )
    UNION ALL
    SELECT 'last_counted_at' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'last_counted_at'
    )
    UNION ALL
    SELECT 'metadata' as column_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items'
        AND column_name = 'metadata'
    )
) as missing;
