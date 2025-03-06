-- Categories Table Migration Script
-- March 2025 Schema Updates

-- Create the categories table to match the entity definition
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    position INTEGER DEFAULT 0,
    parent_id UUID REFERENCES categories(id),
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create closure table for hierarchical tree structure
CREATE TABLE IF NOT EXISTS categories_closure (
    id SERIAL PRIMARY KEY,
    ancestor_id UUID NOT NULL REFERENCES categories(id),
    descendant_id UUID NOT NULL REFERENCES categories(id),
    depth INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_closure_ancestor ON categories_closure(ancestor_id);
CREATE INDEX IF NOT EXISTS idx_categories_closure_descendant ON categories_closure(descendant_id);

-- Add product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Create indexes for the junction table
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Sample data for testing (optional)
-- INSERT INTO categories (name, slug, description, position) 
-- VALUES 
--     ('Men', 'men', 'Men''s clothing and accessories', 1),
--     ('Women', 'women', 'Women''s clothing and accessories', 2),
--     ('Accessories', 'accessories', 'Fashion accessories for all', 3);
