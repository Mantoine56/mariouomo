-- Create shopping_carts table
CREATE TABLE IF NOT EXISTS shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    status TEXT DEFAULT 'active',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_session_id ON shopping_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_status ON shopping_carts(status);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_updated_at ON shopping_carts(updated_at);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_variant_id UUID,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_variant_id ON cart_items(product_variant_id);

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_shopping_carts_updated_at ON shopping_carts;
CREATE TRIGGER update_shopping_carts_updated_at
BEFORE UPDATE ON shopping_carts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for security
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_carts
DROP POLICY IF EXISTS shopping_carts_select_policy ON shopping_carts;
CREATE POLICY shopping_carts_select_policy ON shopping_carts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS shopping_carts_insert_policy ON shopping_carts;
CREATE POLICY shopping_carts_insert_policy ON shopping_carts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS shopping_carts_update_policy ON shopping_carts;
CREATE POLICY shopping_carts_update_policy ON shopping_carts
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS shopping_carts_delete_policy ON shopping_carts;
CREATE POLICY shopping_carts_delete_policy ON shopping_carts
    FOR DELETE USING (true);

-- Create policies for cart_items
DROP POLICY IF EXISTS cart_items_select_policy ON cart_items;
CREATE POLICY cart_items_select_policy ON cart_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS cart_items_insert_policy ON cart_items;
CREATE POLICY cart_items_insert_policy ON cart_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS cart_items_update_policy ON cart_items;
CREATE POLICY cart_items_update_policy ON cart_items
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS cart_items_delete_policy ON cart_items;
CREATE POLICY cart_items_delete_policy ON cart_items
    FOR DELETE USING (true); 