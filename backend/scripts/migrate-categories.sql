-- SQL Script to migrate product categories from metadata to proper category tables
-- This script:
-- 1. Creates categories based on product metadata
-- 2. Links products to their respective categories

-- Step 1: Create categories based on unique values in product metadata
-- We'll generate UUIDs, slugs, and set default values

-- Accessories category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(), -- Generate UUID
  'Accessories', -- Name from metadata
  'accessories', -- Slug derived from name (lowercase, no spaces)
  'All accessories products', -- Description
  1, -- Position in category list
  true, -- Visible by default
  0, -- No child categories yet
  COUNT(*), -- Count of products with this category
  NOW(), -- Created at current timestamp
  NOW() -- Updated at current timestamp
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'accessories');

-- Clothing category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Clothing',
  'clothing',
  'All clothing products',
  2,
  true,
  0,
  COUNT(*),
  NOW(),
  NOW()
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'clothing');

-- Electronics category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Electronics',
  'electronics',
  'All electronics products',
  3,
  true,
  0,
  COUNT(*),
  NOW(),
  NOW()
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics');

-- Equipment category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Equipment',
  'equipment',
  'All equipment products',
  4,
  true,
  0,
  COUNT(*),
  NOW(),
  NOW()
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'equipment');

-- Footwear category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Footwear',
  'footwear',
  'All footwear products',
  5,
  true,
  0,
  COUNT(*),
  NOW(),
  NOW()
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'footwear');

-- Shoes category - merge with Footwear
-- Since 'Shoes' and 'Footwear' are essentially the same, we'll consolidate 
-- by mapping shoes products to the footwear category later

-- Other category
INSERT INTO categories (id, name, slug, description, position, is_visible, child_count, total_products, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Other',
  'other',
  'Miscellaneous products',
  6,
  true,
  0,
  COUNT(*),
  NOW(),
  NOW()
WHERE
  NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'other');

-- Step 2: Link products to their categories
-- We'll create entries in the product_categories junction table

-- Clear existing product_categories entries to avoid duplicates
-- TRUNCATE product_categories;

-- Link Accessories products
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  p.metadata->>'category' = 'Accessories'
  AND c.slug = 'accessories'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Link Clothing products
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  p.metadata->>'category' = 'Clothing'
  AND c.slug = 'clothing'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Link Electronics products
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  p.metadata->>'category' = 'Electronics'
  AND c.slug = 'electronics'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Link Equipment products
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  p.metadata->>'category' = 'Equipment'
  AND c.slug = 'equipment'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Link Footwear products
-- Include both 'Footwear' and 'Shoes' metadata to the footwear category
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  (p.metadata->>'category' = 'Footwear' OR p.metadata->>'category' = 'Shoes')
  AND c.slug = 'footwear'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Link Other products
INSERT INTO product_categories (product_id, category_id)
SELECT 
  p.id, 
  c.id
FROM 
  products p, 
  categories c
WHERE 
  p.metadata->>'category' = 'Other'
  AND c.slug = 'other'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE product_id = p.id AND category_id = c.id
  );

-- Update total_products in each category
UPDATE categories c 
SET total_products = (
  SELECT COUNT(*) FROM product_categories pc 
  WHERE pc.category_id = c.id
);

-- Output results
SELECT 'Category migration completed!' as message;
SELECT c.name, c.total_products FROM categories c ORDER BY c.position; 