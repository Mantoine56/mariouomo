-- Create shopping_carts table
CREATE TABLE IF NOT EXISTS shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    cart_id TEXT UNIQUE NOT NULL, -- Unique identifier for the cart session
    total NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR DEFAULT 'active', -- 'active', 'abandoned', 'converted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES shopping_carts(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_store_id ON shopping_carts(store_id);
CREATE INDEX idx_shopping_carts_updated_at ON shopping_carts(updated_at);
CREATE INDEX idx_shopping_carts_status ON shopping_carts(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant_id ON cart_items(variant_id);

-- Add RLS policies for shopping_carts
CREATE POLICY "Users can view their own carts" ON shopping_carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Store staff can view carts for their store" ON shopping_carts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'store_manager')
        )
    );

CREATE POLICY "Admins can view all carts" ON shopping_carts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to update cart total when items change
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shopping_carts
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM cart_items
            WHERE cart_id = NEW.cart_id
        ),
        updated_at = now()
    WHERE id = NEW.cart_id;
    
    -- Calculate total (considering discounts and taxes)
    UPDATE shopping_carts
    SET 
        total = subtotal - discount_amount + tax_amount,
        updated_at = now()
    WHERE id = NEW.cart_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger the function when cart items change
CREATE TRIGGER update_cart_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_totals();

-- Function to update cart updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger the function when cart is updated
CREATE TRIGGER update_cart_timestamp_trigger
BEFORE UPDATE ON shopping_carts
FOR EACH ROW
EXECUTE FUNCTION update_cart_timestamp(); 