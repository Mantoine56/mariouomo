-- Script to verify constraints on newly created tables
-- This script checks that all necessary constraints exist on our core tables

-- Check Primary Keys
SELECT 
    t.table_name, 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc 
            WHERE tc.table_name = t.table_name 
            AND tc.constraint_type = 'PRIMARY KEY'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END AS primary_key_status
FROM 
    (VALUES ('addresses'), ('categories'), ('categories_closure'), ('product_categories')) AS t(table_name)
ORDER BY t.table_name;

-- Check Foreign Keys
SELECT 
    t.table_name, 
    t.constraint_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc 
            WHERE tc.constraint_name = t.constraint_name
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END AS constraint_status
FROM 
    (VALUES 
        ('addresses', 'fk_addresses_user_id'),
        ('categories', 'fk_categories_parent_id'),
        ('categories_closure', 'fk_categories_closure_ancestor'),
        ('categories_closure', 'fk_categories_closure_descendant'),
        ('product_categories', 'fk_product_categories_product_id'),
        ('product_categories', 'fk_product_categories_category_id')
    ) AS t(table_name, constraint_name)
ORDER BY t.table_name, t.constraint_name;

-- Check Unique Constraints
SELECT 
    t.table_name, 
    t.column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc 
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = t.table_name 
            AND ccu.column_name = t.column_name
            AND tc.constraint_type = 'UNIQUE'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END AS unique_constraint_status
FROM 
    (VALUES 
        ('categories', 'slug')
    ) AS t(table_name, column_name)
ORDER BY t.table_name, t.column_name;

-- Check Indexes
SELECT 
    t.table_name, 
    t.index_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_indexes pi
            WHERE pi.tablename = t.table_name 
            AND pi.indexname = t.index_name
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END AS index_status
FROM 
    (VALUES 
        ('categories_closure', 'idx_categories_closure_ancestor'),
        ('categories_closure', 'idx_categories_closure_descendant'),
        ('product_categories', 'idx_product_categories_product_id'),
        ('product_categories', 'idx_product_categories_category_id')
    ) AS t(table_name, index_name)
ORDER BY t.table_name, t.index_name; 