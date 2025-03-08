-- Migration script to create missing core tables
-- This script creates the missing tables in the production database
-- These tables are: addresses, categories, categories_closure, product_categories

-- Create addresses table
CREATE TABLE addresses (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    street character varying NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    country character varying NOT NULL,
    postal_code character varying NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    userId uuid,
    PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE categories (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    image_url character varying,
    position integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,
    seo_metadata jsonb,
    child_count integer NOT NULL DEFAULT 0,
    total_products integer NOT NULL DEFAULT 0,
    parentId uuid,
    PRIMARY KEY (id),
    UNIQUE (slug)
);

-- Create categories_closure table
CREATE TABLE categories_closure (
    id_ancestor uuid NOT NULL,
    id_descendant uuid NOT NULL,
    PRIMARY KEY (id_ancestor, id_descendant)
);

-- Create product_categories table
CREATE TABLE product_categories (
    product_id uuid NOT NULL,
    category_id uuid NOT NULL,
    PRIMARY KEY (product_id, category_id)
);

-- Add foreign key constraints
ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user_id FOREIGN KEY (userId) REFERENCES profiles(id);
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent_id FOREIGN KEY (parentId) REFERENCES categories(id);
ALTER TABLE categories_closure ADD CONSTRAINT fk_categories_closure_ancestor FOREIGN KEY (id_ancestor) REFERENCES categories(id);
ALTER TABLE categories_closure ADD CONSTRAINT fk_categories_closure_descendant FOREIGN KEY (id_descendant) REFERENCES categories(id);
ALTER TABLE product_categories ADD CONSTRAINT fk_product_categories_product_id FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE product_categories ADD CONSTRAINT fk_product_categories_category_id FOREIGN KEY (category_id) REFERENCES categories(id);

-- Create indexes
CREATE INDEX idx_categories_closure_ancestor ON categories_closure(id_ancestor);
CREATE INDEX idx_categories_closure_descendant ON categories_closure(id_descendant);
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id); 