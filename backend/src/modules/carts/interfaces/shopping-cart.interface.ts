/**
 * Interface representing a shopping cart in the database
 * This aligns with the shopping_carts table structure
 */
export interface ShoppingCart {
  /** Unique identifier for the shopping cart */
  id: string;
  
  /** User who owns this cart (may be null for guest carts) */
  user_id: string | null;
  
  /** Store this cart belongs to */
  store_id: string;
  
  /** Client-side cart identifier (for guest users) */
  cart_id: string;
  
  /** Total amount including tax and discounts */
  total: number;
  
  /** Subtotal amount before tax and discounts */
  subtotal: number;
  
  /** Tax amount applied to this cart */
  tax_amount: number;
  
  /** Discount amount applied to this cart */
  discount_amount: number;
  
  /** Additional metadata stored as JSON */
  metadata: Record<string, any>;
  
  /** Current status of the cart */
  status: CartStatus;
  
  /** When the cart was created */
  created_at: Date;
  
  /** When the cart was last updated */
  updated_at: Date;
}

/**
 * Possible statuses for a shopping cart
 */
export enum CartStatus {
  /** Cart is active and being used */
  ACTIVE = 'active',
  
  /** Cart has been abandoned (inactive for a period) */
  ABANDONED = 'abandoned',
  
  /** Cart was converted to an order */
  CONVERTED = 'converted'
}

/**
 * Interface representing an item in a shopping cart
 * This aligns with the cart_items table structure
 */
export interface CartItem {
  /** Unique identifier for the cart item */
  id: string;
  
  /** Reference to the cart this item belongs to */
  cart_id: string;
  
  /** Product variant ID in the cart (references product_variants table) */
  variant_id: string;
  
  /** Quantity of this item */
  quantity: number;
  
  /** Unit price of the item */
  unit_price: number;
  
  /** Total price for this item (quantity * unit_price) */
  total_price: number;
  
  /** Additional metadata stored as JSON */
  metadata?: Record<string, any>;
  
  /** When the cart item was created */
  created_at: Date;
  
  /** When the cart item was last updated */
  updated_at: Date;
} 