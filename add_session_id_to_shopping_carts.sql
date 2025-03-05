-- Add session_id column to shopping_carts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'shopping_carts'
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE shopping_carts
        ADD COLUMN session_id TEXT;

        -- Add index for better performance
        CREATE INDEX IF NOT EXISTS idx_shopping_carts_session_id ON shopping_carts(session_id);
    END IF;
END $$; 