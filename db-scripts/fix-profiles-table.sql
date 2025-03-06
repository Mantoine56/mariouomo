-- Fix profiles table to match entity definition
-- Run this script in the Supabase SQL editor

-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Update existing records to set full_name from first_name and last_name
UPDATE profiles 
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL AND first_name IS NOT NULL;

-- Update existing records to set email from auth.users if available
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update existing records to set phone from phone_number
UPDATE profiles
SET phone = phone_number
WHERE phone IS NULL AND phone_number IS NOT NULL;

-- Add comment to table
COMMENT ON TABLE profiles IS 'User profiles with extended information beyond auth.users';
