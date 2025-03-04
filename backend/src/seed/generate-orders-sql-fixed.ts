import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates a random date between the provided start and end dates
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generates a random number between the provided min and max (inclusive)
 */
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random decimal number between the provided min and max with the specified number of decimal places
 */
function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

/**
 * Escapes a string for SQL
 */
function escapeSql(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/'/g, "''");
}

/**
 * Main function to generate SQL for orders
 */
async function generateOrdersSql(count: number = 100): Promise<void> {
  // Store ID (this should be a valid store ID from your database)
  const storeId = 'a2af36c3-5054-4f94-b6f9-5846860781cc'; // From the most recent run
  
  // We'll create a dummy user and use its ID for all orders
  // This is for testing only
  const dummyUserId = crypto.randomUUID();
  
  // Sample order statuses
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
  
  // Sample addresses
  const addresses = [
    {
      first_name: 'John',
      last_name: 'Doe',
      address_line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
      phone: '555-123-4567'
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      address_line1: '456 Park Ave',
      city: 'Boston',
      state: 'MA',
      postal_code: '02108',
      country: 'USA',
      phone: '555-987-6543'
    },
    {
      first_name: 'Robert',
      last_name: 'Johnson',
      address_line1: '789 Oak St',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60601',
      country: 'USA',
      phone: '555-567-8901'
    },
    {
      first_name: 'Emily',
      last_name: 'Brown',
      address_line1: '321 Pine St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94101',
      country: 'USA',
      phone: '555-234-5678'
    },
    {
      first_name: 'Michael',
      last_name: 'Wilson',
      address_line1: '654 Elm St',
      city: 'Miami',
      state: 'FL',
      postal_code: '33101',
      country: 'USA',
      phone: '555-345-6789'
    }
  ];
  
  // Sample product variants (using real IDs from your previous successful seeds)
  const productVariants = [
    { id: 'dcca32d6-c59f-4493-94d7-c806a736c930', price: 249.99 }, // Brown 10 (Luxury Leather Loafers)
    { id: 'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6', price: 257.79 }, // Navy 7 (Luxury Leather Loafers)
    { id: '624ca9a9-37f5-462b-9a6b-93fe20c568b9', price: 189.99 }, // Brown 12 (Signature Suede Sneakers)
    { id: 'b601de2c-6f5f-4445-9db5-e542d77fda23', price: 899.99 }, // Tan S (Tailored Wool Suit)
    { id: 'b50dd546-7875-4edc-9aff-4ed170c6c062', price: 250.00 }, // Navy XL (Cashmere Sweater)
    { id: '0476471a-40e4-41c4-ae0b-1dd4abed1f65', price: 275.67 }, // Tan XL (Cashmere Sweater)
    { id: '326062ea-8022-4875-949d-9c4ff34f635a', price: 120.00 }, // Brown One Size (Italian Leather Belt)
    { id: '80516055-b364-4fe4-bd34-d7cde437a2c5', price: 126.10 }, // Navy One Size (Italian Leather Belt)
    { id: '99ae755d-0e3c-4467-b2ba-ea0fe2834c94', price: 195.00 }  // White One Size (Designer Sunglasses)
  ];
  
  // SQL statements
  let sqlStatements = `
-- Disable triggers to improve performance during bulk inserts
DO $$
BEGIN
  -- Check if triggers exist before attempting to disable them
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    EXECUTE 'ALTER TABLE orders DISABLE TRIGGER audit_orders';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    EXECUTE 'ALTER TABLE orders DISABLE TRIGGER update_orders_updated_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_order_items') THEN
    EXECUTE 'ALTER TABLE order_items DISABLE TRIGGER audit_order_items';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_items_updated_at') THEN
    EXECUTE 'ALTER TABLE order_items DISABLE TRIGGER update_order_items_updated_at';
  END IF;
END
$$;

BEGIN;

-- First, disable the foreign key constraint temporarily
SET session_replication_role = 'replica';
  `;
  
  // Generate orders
  for (let i = 0; i < count; i++) {
    // Generate a random date within the last year
    const orderDate = randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString();
    
    // Random shipping and billing addresses
    const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const billingAddress = Math.random() > 0.7
      ? addresses[Math.floor(Math.random() * addresses.length)]
      : shippingAddress; // 70% chance shipping = billing
    
    // Random status
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    
    // Random order metadata
    const metadata = {
      source: Math.random() > 0.5 ? 'website' : 'mobile_app',
      customer_notes: Math.random() > 0.8 ? 'Please deliver in the evening' : null,
      gift_order: Math.random() > 0.9,
      tags: Math.random() > 0.7 ? ['VIP', 'Recurring'] : []
    };
    
    // Generate order items (1-5 items per order)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    let subtotalAmount = 0;
    let shippingAmount = randomDecimal(5, 25);
    let discountAmount = Math.random() > 0.7 ? randomDecimal(5, 30) : 0; // 30% chance of discount
    
    // Create a unique ID for the order
    const orderId = crypto.randomUUID();
    
    // Select random products for this order
    const selectedVariantsIndices = new Set<number>();
    while (selectedVariantsIndices.size < itemCount) {
      const randomIndex = Math.floor(Math.random() * productVariants.length);
      selectedVariantsIndices.add(randomIndex);
    }
    
    // Create order items array to track items for this order
    const orderItems = [];
    
    // Process each selected variant
    for (const index of selectedVariantsIndices) {
      const variant = productVariants[index];
      
      // Random quantity (1-3)
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = variant.price * quantity;
      
      // Add to subtotal
      subtotalAmount += totalPrice;
      
      // Add to order items array
      orderItems.push({
        id: crypto.randomUUID(),
        orderId,
        variantId: variant.id,
        quantity,
        unitPrice: variant.price,
        totalPrice,
        metadata: {
          product_variant_id: variant.id
        },
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }
    
    // Calculate tax (varies between 5% and 10%)
    const taxRate = randomDecimal(0.05, 0.1, 4);
    const taxAmount = subtotalAmount * taxRate;
    
    // Calculate total
    const totalAmount = subtotalAmount + taxAmount + shippingAmount - discountAmount;
    
    // Insert the order SQL
    sqlStatements += `
-- Order ${i + 1}/${count}
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '${orderId}',
  '${storeId}',
  '${dummyUserId}',
  '${status}',
  ${totalAmount.toFixed(2)},
  ${subtotalAmount.toFixed(2)},
  ${taxAmount.toFixed(2)},
  ${shippingAmount.toFixed(2)},
  ${discountAmount.toFixed(2)},
  '${escapeSql(JSON.stringify(shippingAddress))}',
  '${escapeSql(JSON.stringify(billingAddress))}',
  '${escapeSql(JSON.stringify(metadata))}',
  '${orderDate}',
  '${orderDate}'
);
`;
    
    // Insert order items SQL
    if (orderItems.length > 0) {
      for (const item of orderItems) {
        sqlStatements += `
-- Order Item for Order ${i + 1}
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '${item.id}',
  '${item.orderId}',
  '${item.variantId}',
  ${item.quantity},
  ${item.unitPrice.toFixed(2)},
  ${item.totalPrice.toFixed(2)},
  '${escapeSql(JSON.stringify(item.metadata))}',
  '${item.createdAt}',
  '${item.updatedAt}'
);
`;
      }
    }
  }
  
  // Re-enable triggers and commit transaction
  sqlStatements += `
-- Re-enable foreign key constraint
SET session_replication_role = 'origin';

-- Re-enable triggers
DO $$
BEGIN
  -- Check if triggers exist before attempting to enable them
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    EXECUTE 'ALTER TABLE orders ENABLE TRIGGER audit_orders';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    EXECUTE 'ALTER TABLE orders ENABLE TRIGGER update_orders_updated_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_order_items') THEN
    EXECUTE 'ALTER TABLE order_items ENABLE TRIGGER audit_order_items';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_items_updated_at') THEN
    EXECUTE 'ALTER TABLE order_items ENABLE TRIGGER update_order_items_updated_at';
  END IF;
END
$$;

COMMIT;
  `;
  
  // Write SQL to file
  const outputPath = path.resolve(process.cwd(), 'orders-seed-fixed.sql');
  fs.writeFileSync(outputPath, sqlStatements);
  
  console.log(`SQL script generated at: ${outputPath}`);
  console.log(`Generated SQL for ${count} orders with their items`);
}

// Run the function
generateOrdersSql(100)
  .then(() => console.log('SQL generation completed successfully!'))
  .catch((error) => console.error('Error generating SQL:', error)); 