-- Fix inventory_items table to match entity definition
-- Run this script in the Supabase SQL editor

-- Add missing columns to inventory_items table
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Rename reserved column to reserved_quantity
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_items' 
        AND column_name = 'reserved'
    ) THEN
        ALTER TABLE inventory_items RENAME COLUMN reserved TO reserved_quantity;
    END IF;
END $$;

-- Add comments to table
COMMENT ON TABLE inventory_items IS 'Tracks product inventory levels across locations';
COMMENT ON COLUMN inventory_items.version IS 'Used for optimistic locking';
COMMENT ON COLUMN inventory_items.last_counted_at IS 'Timestamp of last physical inventory count';
COMMENT ON COLUMN inventory_items.reorder_point IS 'Quantity threshold that triggers reordering';
COMMENT ON COLUMN inventory_items.reorder_quantity IS 'Default quantity to reorder when below reorder_point';
