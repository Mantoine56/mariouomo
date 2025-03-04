/**
 * Complete Database Seed Script
 * 
 * This script creates a full set of test data for the Mario Uomo e-commerce platform.
 * It creates:
 * - A store
 * - Products with variants and inventory
 * - Note: Profiles creation is skipped as it requires Supabase auth integration
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces
interface ProductVariant {
  color: string;
  size: string;
  price_adjustment?: number;
}

interface ProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  compare_at_price?: number;
  featured?: boolean;
  variants: ProductVariant[];
}

// Load environment variables based on NODE_ENV
async function loadEnv(): Promise<void> {
  console.log('Loading environment variables...');
  
  const envPath = process.env.NODE_ENV === 'production' 
    ? '.env' 
    : '.env.local';
  
  console.log(`Found ${envPath} file, loading...`);
  dotenv.config({ path: path.resolve(process.cwd(), envPath) });
}

// Connect to database
async function connectToDatabase(): Promise<DataSource> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in environment variables');
  }
  
  console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
  console.log('Connecting to database...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [],
  });
  
  await dataSource.initialize();
  console.log('Database connection successful!');
  
  return dataSource;
}

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
}

/**
 * Creates a store using direct SQL with specific triggers disabled
 * This avoids issues with the audit triggers
 */
async function createStore(dataSource: DataSource): Promise<any> {
  console.log('Creating store...');
  
  // Start a transaction to ensure all operations are atomic
  console.log('Starting transaction...');
  await dataSource.query('BEGIN');
  
  try {
    // Temporarily disable specific triggers on stores table
    console.log('Temporarily disabling specific triggers on stores table...');
    await dataSource.query('ALTER TABLE stores DISABLE TRIGGER audit_stores');
    await dataSource.query('ALTER TABLE stores DISABLE TRIGGER update_stores_updated_at');
    
    // Create store data
    const storeId = uuidv4();
    const storeName = 'Mario Uomo Main Store';
    const domain = 'mariouomo.com';
    const now = new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // Set date to 2 years in future for demo
    
    const metadata = {
      location: 'New York',
      established: '2020',
      flagship: true,
      contact_email: 'store@mariouomo.com',
      contact_phone: '+1-555-123-4567',
      currency: 'USD'
    };
    
    // Insert store record
    console.log('Inserting store record...');
    const insertQuery = `
      INSERT INTO stores (id, name, domain, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
     `;
    
    const store = await dataSource.query(
      insertQuery,
      [storeId, storeName, domain, JSON.stringify(metadata), now, now]
    );
    
    // Re-enable triggers
    console.log('Re-enabling specific triggers on stores table...');
    await dataSource.query('ALTER TABLE stores ENABLE TRIGGER audit_stores');
    await dataSource.query('ALTER TABLE stores ENABLE TRIGGER update_stores_updated_at');
    
    // Commit the transaction
    console.log('Committing transaction...');
    await dataSource.query('COMMIT');
    
    console.log(`Store created with ID: ${store[0].id}`);
    return store[0];
  } catch (error) {
    // Rollback in case of error
    await dataSource.query('ROLLBACK');
    console.error('Error creating store:', error);
    throw error;
  }
}

/**
 * Creates products with variants and inventory items
 */
async function createProducts(dataSource: DataSource, store: any): Promise<any[]> {
  console.log('Creating products...');
  
  // Start transaction for products
  console.log('Starting transaction for products...');
  await dataSource.query('BEGIN');
  
  try {
    // Disable triggers on products table
    console.log('Disabling triggers on products table...');
    await dataSource.query('ALTER TABLE products DISABLE TRIGGER audit_products');
    await dataSource.query('ALTER TABLE products DISABLE TRIGGER update_products_updated_at');
    
    const products = [];
    const categories = ['Shoes', 'Clothing', 'Accessories', 'Equipment', 'Electronics'];
    const colors = ['Brown', 'Navy', 'Tan', 'Grey', 'White', 'Black'];
    const sizes = ['S', 'M', 'L', 'XL', '7', '8', '9', '10', '11', '12', 'One Size'];
    const now = new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // Set date to 2 years in future for demo
    
    // Sample product data
    const productData: ProductData[] = [
      {
        name: 'Luxury Leather Loafers',
        description: 'Premium Italian leather loafers',
        category: 'Shoes',
        price: 249.99,
        cost: 99.996,
        variants: [
          { color: 'Brown', size: '10' },
          { color: 'Navy', size: '7', price_adjustment: 7.8 }
        ]
      },
      {
        name: 'Signature Suede Sneakers',
        description: 'Casual suede sneakers with unique sole',
        category: 'Shoes',
        price: 189.99,
        cost: 75.996,
        variants: [
          { color: 'Brown', size: '12' }
        ]
      },
      {
        name: 'Tailored Wool Suit',
        description: 'Premium wool suit with expert tailoring',
        category: 'Clothing',
        price: 899.99,
        cost: 359.996,
        compare_at_price: 1079.988,
        variants: [
          { color: 'Tan', size: 'S' }
        ]
      },
      {
        name: 'Cashmere Sweater',
        description: 'Luxurious 100% cashmere knit',
        category: 'Clothing',
        price: 250,
        cost: 100,
        featured: true,
        variants: [
          { color: 'Navy', size: 'XL' },
          { color: 'Tan', size: 'XL', price_adjustment: 25.67 }
        ]
      },
      {
        name: 'Italian Leather Belt',
        description: 'Handcrafted leather belt with designer buckle',
        category: 'Accessories',
        price: 120,
        cost: 48,
        variants: [
          { color: 'Brown', size: 'One Size' },
          { color: 'Navy', size: 'One Size', price_adjustment: 6.1 }
        ]
      },
      {
        name: 'Designer Sunglasses',
        description: 'UV protective lenses with signature frames',
        category: 'Accessories',
        price: 195,
        cost: 78,
        compare_at_price: 234,
        variants: [
          { color: 'White', size: 'One Size' }
        ]
      },
      {
        name: 'Premium Golf Set',
        description: 'Professional-grade golf club set',
        category: 'Equipment',
        price: 1250,
        cost: 500,
        featured: true,
        variants: [
          { color: 'Grey', size: 'One Size' }
        ]
      },
      {
        name: 'Designer Tennis Racket',
        description: 'Performance carbon fiber tennis racket',
        category: 'Equipment',
        price: 220,
        cost: 88,
        variants: [
          { color: 'Tan', size: 'One Size' },
          { color: 'Black', size: 'One Size', price_adjustment: 21.01 }
        ]
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracker with heart monitoring',
        category: 'Electronics',
        price: 299.99,
        cost: 119.996,
        variants: [
          { color: 'Navy', size: 'One Size' }
        ]
      },
      {
        name: 'Wireless Earbuds',
        description: 'Premium sound quality with noise cancellation',
        category: 'Electronics',
        price: 179.99,
        cost: 71.996,
        variants: [
          { color: 'Brown', size: 'One Size' }
        ]
      }
    ];
    
    // Create products
    for (const data of productData) {
      console.log(`Creating product: ${data.name}...`);
      
      const productId = uuidv4();
      const category = data.category;
      
      // Create metadata
      const metadata = {
        category,
        tags: [category.toLowerCase(), 'premium', 'luxury'],
        type: 'physical',
        weight: randomDecimal(0.5, 5),
        dimensions: {
          length: randomDecimal(5, 50),
          width: randomDecimal(5, 30),
          height: randomDecimal(2, 20),
          unit: 'cm'
        },
        featured: data.featured || false
      };
      
      // Insert product
      const productQuery = `
          INSERT INTO products (
            id, store_id, name, description, status, price, 
            compare_at_price, cost_price, metadata, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;
         `;
      
      const product = await dataSource.query(
        productQuery,
        [
          productId,
          store.id,
          data.name,
          data.description,
          'active',
          data.price,
          data.compare_at_price || null,
          data.cost,
          JSON.stringify(metadata),
          now,
          now
        ]
      );
      
      products.push(product[0]);
      
      // Create variants for product
      for (const [index, variant] of data.variants.entries()) {
        console.log(`  Creating variant: ${variant.color} ${variant.size}...`);
        
        const variantId = uuidv4();
        const sku = `${category.substring(0, 3).toUpperCase()}-${variant.color.charAt(0)}${variant.size}-${randomNumber(1000, 9999)}`;
        const barcode = `${randomNumber(100000000000, 999999999999)}`;
        
        const variantQuery = `
            INSERT INTO product_variants (
              id, product_id, sku, barcode, price_adjustment, 
              position, option_values, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
           `;
        
        const variantResult = await dataSource.query(
          variantQuery,
          [
            variantId,
            productId,
            sku,
            barcode,
            variant.price_adjustment || 0,
            index,
            JSON.stringify({ size: variant.size, color: variant.color }),
            now,
            now
          ]
        );
        
        // Create inventory for variant
        console.log(`    Creating inventory for variant...`);
        const inventoryId = uuidv4();
        const quantity = randomNumber(5, 50);
        
        const inventoryQuery = `
            INSERT INTO inventory_items (
              id, variant_id, quantity, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5);
           `;
        
        await dataSource.query(
          inventoryQuery,
          [
            inventoryId,
            variantId,
            quantity,
            now,
            now
          ]
        );
      }
    }
    
    // Re-enable triggers
    console.log('Re-enabling triggers on products table...');
    await dataSource.query('ALTER TABLE products ENABLE TRIGGER audit_products');
    await dataSource.query('ALTER TABLE products ENABLE TRIGGER update_products_updated_at');
    
    // Commit transaction
    console.log('Committing product transaction...');
    await dataSource.query('COMMIT');
    
    console.log(`Created ${products.length} products with variants and inventory.`);
    return products;
  } catch (error) {
    // Rollback transaction on error
    await dataSource.query('ROLLBACK');
    console.error('Error creating products:', error);
    throw error;
  }
}

/**
 * Generates sample orders
 * This function creates orders without requiring profiles/users by using direct SQL
 * @param dataSource Database connection
 * @param store Store object
 * @param products List of products with variants
 * @param count Number of orders to generate
 */
async function generateOrders(
  dataSource: DataSource, 
  store: any, 
  products: any[], 
  count: number = 200
): Promise<void> {
  console.log(`Generating ${count} sample orders...`);
  
  // Start a transaction for all orders
  console.log('Starting transaction for orders...');
  await dataSource.query('BEGIN');
  
  try {
    // Temporarily disable triggers on orders table
    console.log('Disabling triggers on orders table...');
    await dataSource.query('ALTER TABLE orders DISABLE TRIGGER audit_orders');
    await dataSource.query('ALTER TABLE orders DISABLE TRIGGER update_orders_updated_at');
    
    // Create a fake user ID that we'll use for all orders
    // Note: This is for testing only. In production, orders should be linked to real users
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    
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
    
    // Generate orders
    for (let i = 0; i < count; i++) {
      // Generate a random date within the last year
      const orderDate = randomDate(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        new Date()
      );
      
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
      let taxAmount = 0;
      let shippingAmount = randomDecimal(5, 25);
      let discountAmount = Math.random() > 0.7 ? randomDecimal(5, 30) : 0; // 30% chance of discount
      
      // Create a unique ID for the order
      const orderId = crypto.randomUUID();
      
      // Select random products for this order
      const selectedProductIndices = new Set<number>();
      while (selectedProductIndices.size < itemCount) {
        const randomIndex = Math.floor(Math.random() * products.length);
        selectedProductIndices.add(randomIndex);
      }
      
      // Create order items array to track items for this order
      const orderItems = [];
      
      // Process each selected product
      for (const index of selectedProductIndices) {
        const product = products[index];
        
        // Select a random variant for the product
        const variantsResult = await dataSource.query(
          `SELECT * FROM product_variants WHERE product_id = $1`,
          [product.id]
        );
        
        if (variantsResult.length > 0) {
          const variant = variantsResult[Math.floor(Math.random() * variantsResult.length)];
          
          // Get the actual product price (including any variant price adjustment)
          const productResult = await dataSource.query(
            `SELECT * FROM products WHERE id = $1`,
            [product.id]
          );
          
          if (productResult.length > 0) {
            const productPrice = parseFloat(productResult[0].price);
            const priceAdjustment = variant.price_adjustment ? parseFloat(variant.price_adjustment) : 0;
            const unitPrice = productPrice + priceAdjustment;
            
            // Random quantity (1-3)
            const quantity = Math.floor(Math.random() * 3) + 1;
            const totalPrice = unitPrice * quantity;
            
            // Add to subtotal
            subtotalAmount += totalPrice;
            
            // Add to order items array
            orderItems.push({
              id: crypto.randomUUID(),
              orderId,
              variantId: variant.id,
              quantity,
              unitPrice,
              totalPrice,
              metadata: {
                product_name: productResult[0].name,
                option_values: variant.option_values
              },
              createdAt: orderDate,
              updatedAt: orderDate
            });
          }
        }
      }
      
      // Calculate tax (varies between 5% and 10%)
      const taxRate = randomDecimal(0.05, 0.1, 4);
      taxAmount = subtotalAmount * taxRate;
      
      // Calculate total
      const totalAmount = subtotalAmount + taxAmount + shippingAmount - discountAmount;
      
      // Insert the order
      console.log(`Creating order ${i + 1}/${count}...`);
      await dataSource.query(`
        INSERT INTO orders (
          id, store_id, user_id, status, total_amount, subtotal_amount, 
          tax_amount, shipping_amount, discount_amount, shipping_address, 
          billing_address, metadata, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `, [
        orderId,
        store.id,
        fakeUserId,
        status,
        totalAmount,
        subtotalAmount,
        taxAmount,
        shippingAmount,
        discountAmount,
        JSON.stringify(shippingAddress),
        JSON.stringify(billingAddress),
        JSON.stringify(metadata),
        orderDate,
        orderDate
      ]);
      
      // Insert order items
      if (orderItems.length > 0) {
        console.log(`  Adding ${orderItems.length} items to order...`);
        
        // Disable triggers on order_items table
        await dataSource.query('ALTER TABLE order_items DISABLE TRIGGER audit_order_items');
        await dataSource.query('ALTER TABLE order_items DISABLE TRIGGER update_order_items_updated_at');
        
        for (const item of orderItems) {
          await dataSource.query(`
            INSERT INTO order_items (
              id, order_id, variant_id, quantity, unit_price, 
              total_price, metadata, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
          `, [
            item.id,
            item.orderId,
            item.variantId,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            JSON.stringify(item.metadata),
            item.createdAt,
            item.updatedAt
          ]);
        }
        
        // Re-enable triggers on order_items table
        await dataSource.query('ALTER TABLE order_items ENABLE TRIGGER audit_order_items');
        await dataSource.query('ALTER TABLE order_items ENABLE TRIGGER update_order_items_updated_at');
      }
    }
    
    // Re-enable triggers on orders table
    console.log('Re-enabling triggers on orders table...');
    await dataSource.query('ALTER TABLE orders ENABLE TRIGGER audit_orders');
    await dataSource.query('ALTER TABLE orders ENABLE TRIGGER update_orders_updated_at');
    
    // Commit the transaction
    console.log('Committing transaction...');
    await dataSource.query('COMMIT');
    
    console.log(`Successfully generated ${count} sample orders.`);
  } catch (error) {
    // Rollback the transaction on error
    console.error('Error generating orders:', error);
    await dataSource.query('ROLLBACK');
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  let dataSource: DataSource | null = null;
  
  try {
    // Load environment variables
    await loadEnv();
    
    // Connect to database
    dataSource = await connectToDatabase();
    
    // Create store
    const store = await createStore(dataSource);
    
    // Create products
    const products = await createProducts(dataSource, store);
    
    // Skip profile creation - requires Supabase Auth integration
    console.log('Skipping profile creation - requires Supabase Auth integration.');
    console.log('To create profiles, users must be created through Supabase Auth first.');
    
    // Generate orders
    await generateOrders(dataSource, store, products, 200);
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error in seed script:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the main function
main(); 