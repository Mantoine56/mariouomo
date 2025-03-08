-- Script to drop test tables from production database
-- This should ONLY be run after verifying that proper tables have been created
-- and any necessary data has been migrated

-- Drop test tables in a specific order to handle foreign key constraints
DROP TABLE IF EXISTS test_product_categories CASCADE;
DROP TABLE IF EXISTS test_product_images CASCADE;
DROP TABLE IF EXISTS test_product_variants CASCADE;
DROP TABLE IF EXISTS test_products CASCADE;
DROP TABLE IF EXISTS test_categories_closure CASCADE;
DROP TABLE IF EXISTS test_categories CASCADE;
DROP TABLE IF EXISTS test_discount_products CASCADE;
DROP TABLE IF EXISTS test_discount_stores CASCADE;
DROP TABLE IF EXISTS test_discounts CASCADE;
DROP TABLE IF EXISTS test_stores CASCADE;
DROP TABLE IF EXISTS test_orders CASCADE;
DROP TABLE IF EXISTS test_order_items CASCADE;
DROP TABLE IF EXISTS test_cart_items CASCADE;
DROP TABLE IF EXISTS test_carts CASCADE;
DROP TABLE IF EXISTS test_addresses CASCADE;
DROP TABLE IF EXISTS test_customer_metrics CASCADE;
DROP TABLE IF EXISTS test_profiles CASCADE;
DROP TABLE IF EXISTS test_users CASCADE;

-- Additional tables found in database
DROP TABLE IF EXISTS test_events CASCADE;
DROP TABLE IF EXISTS test_gift_cards CASCADE;
DROP TABLE IF EXISTS test_inventory_items CASCADE;
DROP TABLE IF EXISTS test_inventory_metrics CASCADE;
DROP TABLE IF EXISTS test_payments CASCADE;
DROP TABLE IF EXISTS test_real_time_metrics CASCADE;
DROP TABLE IF EXISTS test_sales_metrics CASCADE;
DROP TABLE IF EXISTS test_shipments CASCADE;
DROP TABLE IF EXISTS test_user_addresses CASCADE;

-- Verify all test tables have been dropped
DO $$
BEGIN
    RAISE NOTICE 'Verifying all test tables have been dropped...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'test_%') THEN
        RAISE WARNING 'Some test tables still exist. Please check and remove them manually.';
    ELSE
        RAISE NOTICE 'All test tables have been successfully dropped.';
    END IF;
END $$; 