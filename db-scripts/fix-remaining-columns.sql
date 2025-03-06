-- Fix remaining missing columns in inventory_items table
-- Run this script in the Supabase SQL Editor

-- Add missing columns to inventory_items table
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMPTZ;

-- Add comments to the new columns
COMMENT ON COLUMN inventory_items.metadata IS 'Additional metadata for inventory items';
COMMENT ON COLUMN inventory_items.last_counted_at IS 'Timestamp of last physical inventory count';

-- Log the changes
SELECT 'Remaining columns added to inventory_items table' as result;
