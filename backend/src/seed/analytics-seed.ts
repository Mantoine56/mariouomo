/**
 * Analytics Database Seed Script
 * 
 * This script generates realistic data for testing the analytics API endpoints.
 * It creates historical sales data, customer acquisition metrics, product performance,
 * and category breakdown for different time periods.
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnalyticsSeedService {
  private readonly logger = new Logger(AnalyticsSeedService.name);
  private debugLogFile: string | null;
  
  constructor(
    private readonly dataSource: DataSource
  ) {
    // Force direct output to stdout
    process.stdout.write('AnalyticsSeedService constructor called\n');
    
    // Setup debug logging
    this.setupLogging();
    
    // Output again after setup
    process.stdout.write('AnalyticsSeedService initialization complete\n');
  }
  
  /**
   * Setup logging directory and files
   */
  private setupLogging(): void {
    try {
      process.stdout.write('Setting up logging for AnalyticsSeedService...\n');
      
      const logDir = './debug-logs';
      // Create directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        process.stdout.write(`Creating log directory: ${logDir}\n`);
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Get current time for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.debugLogFile = path.join(logDir, `analytics-seed-${timestamp}.log`);
      
      // Write initial log entry
      this.logDebug('AnalyticsSeedService initialized');
      this.logDebug(`Current working directory: ${process.cwd()}`);
      this.logDebug(`Database URL: ${this.maskDatabaseUrl(process.env.DATABASE_URL)}`);
      
      process.stdout.write('Logging setup complete for AnalyticsSeedService\n');
    } catch (error) {
      process.stderr.write(`Error setting up logging for AnalyticsSeedService: ${error}\n`);
      // Try alternative directory
      try {
        const altLogDir = '/tmp/seed-logs';
        if (!fs.existsSync(altLogDir)) {
          process.stdout.write(`Creating alternative log directory: ${altLogDir}\n`);
          fs.mkdirSync(altLogDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.debugLogFile = path.join(altLogDir, `analytics-seed-${timestamp}.log`);
        this.logDebug('AnalyticsSeedService initialized using alternative log directory');
      } catch (altError) {
        process.stderr.write(`Failed to create even alternative log directory: ${altError}\n`);
        // Last resort - don't use file logging
        this.debugLogFile = null;
      }
    }
  }
  
  /**
   * Mask sensitive parts of the database URL for logging
   */
  private maskDatabaseUrl(url: string | undefined): string {
    if (!url) return 'undefined';
    try {
      // Simple regex to mask the password in the connection string
      return url.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
    } catch (error) {
      return 'Error masking URL';
    }
  }
  
  /**
   * Log message to debug file and stdout
   */
  private logDebug(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Always log to stdout
    process.stdout.write(`${message}\n`);
    
    // Write to file only if file path is set
    if (this.debugLogFile) {
      try {
        fs.appendFileSync(this.debugLogFile, logMessage);
      } catch (error) {
        process.stderr.write(`Error writing to log file: ${error.message}\n`);
      }
    }
  }
  
  /**
   * Log error message and details to debug file and stderr
   */
  private logError(message: string, error: any): void {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    const logMessage = `[${timestamp}] ERROR: ${message}\n${errorMessage}\n`;
    
    // Always log to stderr
    process.stderr.write(`ERROR: ${message}\n${errorMessage}\n`);
    
    // Write to file only if file path is set
    if (this.debugLogFile) {
      try {
        fs.appendFileSync(this.debugLogFile, logMessage);
      } catch (logError) {
        process.stderr.write(`Error writing to log file: ${logError.message}\n`);
      }
    }
  }
  
  /**
   * Generate random dates within a range
   */
  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  
  /**
   * Generate random number within a range
   */
  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  /**
   * Generate random decimal within a range, with specified decimal places
   */
  private randomDecimal(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
  }
  
  /**
   * Create a default store for our products
   */
  async createStore(): Promise<any> {
    // Create store matching the actual database schema
    const storeData = {
      id: uuidv4(),
      name: 'Mario Uomo Main Store',
      domain: 'mariouomo.com',
      metadata: {
        location: 'New York',
        established: '2020',
        flagship: true,
        contact_email: 'store@mariouomo.com',
        contact_phone: '+1-555-123-4567',
        currency: 'USD'
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return await this.dataSource.getRepository('stores').save(storeData);
  }
  
  /**
   * Define product categories (as metadata since we don't have a categories table)
   */
  private getProductCategories(): string[] {
    return [
      'Shoes',
      'Clothing',
      'Accessories',
      'Equipment',
      'Electronics'
    ];
  }
  
  /**
   * Create sample products with their categories stored in metadata
   */
  async createSampleProducts(store: any): Promise<any[]> {
    const products: any[] = [];
    const categories = this.getProductCategories();
    
    // Sample products by category name
    const productsByCategory: Record<string, Array<{name: string, price: number, description: string}>> = {
      'Shoes': [
        { name: 'Luxury Leather Loafers', price: 249.99, description: 'Premium Italian leather loafers' },
        { name: 'Signature Suede Sneakers', price: 189.99, description: 'Casual suede sneakers with unique sole' },
        { name: 'Classic Oxford Shoes', price: 299.99, description: 'Timeless Oxford design in genuine leather' },
        { name: 'Designer Derby Shoes', price: 275.00, description: 'Contemporary take on the classic Derby' },
        { name: 'Handcrafted Boots', price: 350.00, description: 'Rugged boots made by master craftsmen' },
      ],
      'Clothing': [
        { name: 'Tailored Wool Suit', price: 899.99, description: 'Premium wool suit with expert tailoring' },
        { name: 'Cashmere Sweater', price: 250.00, description: 'Luxurious 100% cashmere knit' },
        { name: 'Silk Dress Shirt', price: 185.00, description: 'Smooth silk shirt with mother-of-pearl buttons' },
        { name: 'Designer Denim Jeans', price: 220.00, description: 'Premium denim with signature wash' },
        { name: 'Merino Wool Coat', price: 450.00, description: 'Elegant overcoat in fine merino wool' },
      ],
      'Accessories': [
        { name: 'Italian Leather Belt', price: 120.00, description: 'Handcrafted leather belt with designer buckle' },
        { name: 'Designer Sunglasses', price: 195.00, description: 'UV protective lenses with signature frames' },
        { name: 'Luxury Watch', price: 2500.00, description: 'Swiss-made automatic watch' },
        { name: 'Silk Necktie', price: 95.00, description: 'Hand-finished silk tie in signature pattern' },
        { name: 'Leather Wallet', price: 150.00, description: 'Full-grain leather wallet with multiple compartments' },
      ],
      'Equipment': [
        { name: 'Premium Golf Set', price: 1250.00, description: 'Professional-grade golf club set' },
        { name: 'Designer Tennis Racket', price: 220.00, description: 'Performance carbon fiber tennis racket' },
        { name: 'Luxury Yoga Mat', price: 120.00, description: 'Extra-thick sustainable yoga mat' },
        { name: 'Sport Duffel Bag', price: 175.00, description: 'Water-resistant gym bag with compartments' },
        { name: 'Professional Fitness Tracker', price: 199.99, description: 'Advanced activity and health monitor' },
      ],
      'Electronics': [
        { name: 'Smart Fitness Watch', price: 299.99, description: 'Advanced fitness tracker with heart monitoring' },
        { name: 'Wireless Earbuds', price: 179.99, description: 'Premium sound quality with noise cancellation' },
        { name: 'Bluetooth Speaker', price: 129.99, description: 'Portable speaker with crystal clear sound' },
        { name: 'Smartphone Case', price: 59.99, description: 'Protective designer case' },
        { name: 'Charging Station', price: 89.99, description: 'Multi-device charging dock' },
      ],
    };
    
    const productRepo = this.dataSource.getRepository('products');
    const variantRepo = this.dataSource.getRepository('product_variants');
    const inventoryRepo = this.dataSource.getRepository('inventory_items');
    const imageRepo = this.dataSource.getRepository('product_images');
    
    for (const category of categories) {
      const categoryProducts = productsByCategory[category] || [];
      
      for (const productData of categoryProducts) {
        // Determine sale price (25% of products will be on sale)
        const onSale = Math.random() > 0.75;
        const compareAtPrice = onSale ? productData.price * 1.2 : null;
        const costPrice = productData.price * 0.4; // 60% markup
        
        // Create the product
        const productId = uuidv4();
        const product = {
          id: productId,
          store_id: store.id,
          name: productData.name,
          description: productData.description,
          status: 'active',
          price: productData.price,
          compare_at_price: compareAtPrice,
          cost_price: costPrice,
          metadata: {
            category: category,
            tags: [category.toLowerCase(), 'premium', 'luxury'],
            type: 'physical',
            weight: this.randomDecimal(0.2, 5, 1),
            dimensions: {
              length: this.randomDecimal(5, 50, 1),
              width: this.randomDecimal(5, 30, 1),
              height: this.randomDecimal(2, 20, 1),
              unit: 'cm'
            },
            featured: Math.random() > 0.8
          },
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const savedProduct = await productRepo.save(product);
        
        // Create variants (1-3 per product)
        const variantCount = this.randomNumber(1, 3);
        
        for (let i = 0; i < variantCount; i++) {
          // Define size options based on product category
          let sizeOptions;
          if (category === 'Shoes') {
            sizeOptions = ['7', '8', '9', '10', '11', '12'];
          } else if (category === 'Clothing') {
            sizeOptions = ['S', 'M', 'L', 'XL'];
          } else {
            sizeOptions = ['One Size'];
          }
          
          // Define color options
          const colorOptions = ['Black', 'Brown', 'Navy', 'Tan', 'Grey', 'White'];
          
          // Select random options
          const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
          const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
          
          // Create variant
          const variantId = uuidv4();
          const variant = {
            id: variantId,
            product_id: savedProduct.id,
            sku: `${category.substring(0, 3).toUpperCase()}-${color.substring(0, 1)}${size}-${this.randomNumber(1000, 9999)}`,
            barcode: `${this.randomNumber(100000000000, 999999999999)}`,
            price_adjustment: i === 0 ? 0 : this.randomDecimal(5, 30), // First variant is base price, others have adjustments
            position: i,
            option_values: {
              size: size,
              color: color
            },
            created_at: new Date(),
            updated_at: new Date()
          };
          
          const savedVariant = await variantRepo.save(variant);
          
          // Create inventory for this variant
          const inventoryItem = {
            id: uuidv4(),
            variant_id: savedVariant.id,
            quantity: this.randomNumber(10, 100),
            reserved: this.randomNumber(0, 5),
            created_at: new Date(),
            updated_at: new Date()
          };
          
          await inventoryRepo.save(inventoryItem);
        }
        
        // Create a product image
        const image = {
          id: uuidv4(),
          product_id: savedProduct.id,
          url: `https://source.unsplash.com/random/800x600/?${category.toLowerCase()},${productData.name.split(' ')[0].toLowerCase()}`,
          alt_text: productData.name,
          position: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        await imageRepo.save(image);
        
        products.push(savedProduct);
      }
    }
    
    return products;
  }
  
  /**
   * Create sample profiles for orders
   */
  async createSampleProfiles(): Promise<any[]> {
    const profiles: any[] = [];
    const profileRepo = this.dataSource.getRepository('profiles');
    
    for (let i = 0; i < 100; i++) {
      // Create profile
      const profile = {
        id: uuidv4(),
        first_name: `User`,
        last_name: `${i}`,
        phone_number: `+1-555-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`,
        status: 'active',
        role: 'customer',
        metadata: {
          preferences: {
            newsletter: Math.random() > 0.5,
            marketing: Math.random() > 0.7,
            theme: Math.random() > 0.5 ? 'light' : 'dark'
          },
          email: `user${i}@example.com`,
          registration_date: this.randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
          source: ['direct', 'search', 'referral', 'social'][Math.floor(Math.random() * 4)]
        },
        created_at: new Date(),
        updated_at: new Date()
      };
      
      profiles.push(await profileRepo.save(profile));
    }
    
    return profiles;
  }
  
  /**
   * Generate historical orders with reasonable patterns
   */
  async generateOrders(store: any, profiles: any[], products: any[]): Promise<void> {
    // Start date: 90 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    // End date: today
    const endDate = new Date();
    
    // Create 500-1000 orders 
    const totalOrders = this.randomNumber(500, 1000);
    
    const orderRepo = this.dataSource.getRepository('orders');
    const orderItemRepo = this.dataSource.getRepository('order_items');
    const variantRepo = this.dataSource.getRepository('product_variants');
    const inventoryRepo = this.dataSource.getRepository('inventory_items');
    
    for (let i = 0; i < totalOrders; i++) {
      // Create order with random date
      const orderDate = this.randomDate(startDate, endDate);
      
      // Get random profile
      const profile = profiles[this.randomNumber(0, profiles.length - 1)];
      
      const shippingAddress = {
        street: `${this.randomNumber(100, 9999)} Main St`,
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: `${this.randomNumber(10000, 99999)}`
      };
      
      // Create the order
      const order = {
        id: uuidv4(),
        store_id: store.id,
        user_id: profile.id,
        status: 'delivered', // Will update later based on date
        total_amount: 0, // Will update after adding items
        subtotal_amount: 0, // Will update after adding items
        tax_amount: 0, // Will update after adding items
        shipping_amount: this.randomDecimal(5, 25),
        discount_amount: 0, // Will update if discounts applied
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Use same address for billing
        metadata: {
          notes: Math.random() > 0.7 ? 'Please deliver in the afternoon' : null,
          gift: Math.random() > 0.9,
          source: 'web',
        },
        created_at: orderDate,
        updated_at: orderDate
      };
      
      const savedOrder = await orderRepo.save(order);
      
      // Create 1-5 order items
      const itemCount = this.randomNumber(1, 5);
      let subtotalAmount = 0;
      
      // Select random products for this order
      const selectedProducts: any[] = [];
      while (selectedProducts.length < itemCount) {
        const product = products[this.randomNumber(0, products.length - 1)];
        if (!selectedProducts.includes(product)) {
          selectedProducts.push(product);
        }
      }
      
      // Create order items for selected products
      for (const product of selectedProducts) {
        // Get a random variant for this product
        const variants = await variantRepo.find({ 
          where: { product_id: product.id }
        });
        
        if (variants.length > 0) {
          const variant = variants[this.randomNumber(0, variants.length - 1)];
          const quantity = this.randomNumber(1, 3);
          
          // Calculate unit price based on product price and variant adjustment
          const unitPrice = product.price + variant.price_adjustment;
          const totalPrice = unitPrice * quantity;
          
          // Create order item
          const orderItem = {
            id: uuidv4(),
            order_id: savedOrder.id,
            variant_id: variant.id,
            quantity: quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            metadata: {
              product_name: product.name,
              variant_name: `${product.name} - ${variant.option_values.color} (${variant.option_values.size})`,
              sku: variant.sku
            },
            created_at: orderDate,
            updated_at: orderDate
          };
          
          await orderItemRepo.save(orderItem);
          subtotalAmount += totalPrice;
          
          // Update inventory (decrease available quantity)
          const inventory = await inventoryRepo.findOne({
            where: { variant_id: variant.id }
          });
          
          if (inventory) {
            inventory.quantity = Math.max(0, inventory.quantity - quantity);
            inventory.updated_at = new Date();
            await inventoryRepo.save(inventory);
          }
        }
      }
      
      // Calculate tax and discount
      const taxAmount = subtotalAmount * 0.08; // 8% tax
      
      // Apply discount to ~25% of orders
      let discountAmount = 0;
      if (Math.random() > 0.75) {
        discountAmount = this.randomDecimal(5, subtotalAmount * 0.15);
      }
      
      // Update order with final amounts
      savedOrder.subtotal_amount = subtotalAmount;
      savedOrder.tax_amount = taxAmount;
      savedOrder.discount_amount = discountAmount;
      savedOrder.total_amount = subtotalAmount + taxAmount + savedOrder.shipping_amount - discountAmount;
      
      // Set status based on date
      const daysDiff = Math.floor((endDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 2) {
        savedOrder.status = Math.random() > 0.5 ? 'processing' : 'shipped';
      } else if (daysDiff < 5 && Math.random() > 0.8) {
        savedOrder.status = 'cancelled';
      } else {
        savedOrder.status = 'delivered';
      }
      
      await orderRepo.save(savedOrder);
    }
  }
  
  /**
   * Run the full seed operation
   */
  async seed(): Promise<void> {
    process.stdout.write('Starting seed operation in AnalyticsSeedService\n');
    this.logDebug('Starting seed operation in AnalyticsSeedService');
    
    try {
      // Verify database connection
      process.stdout.write('Checking database connection...\n');
      this.logDebug('Checking database connection...');
      
      try {
        const connectionStatus = this.dataSource.isInitialized ? 'Connected' : 'Not connected';
        process.stdout.write(`Database connection status: ${connectionStatus}\n`);
        this.logDebug(`Database connection status: ${connectionStatus}`);
        
        if (!this.dataSource.isInitialized) {
          process.stdout.write('Database connection is not initialized, attempting to initialize...\n');
          this.logDebug('Database connection is not initialized, attempting to initialize...');
          await this.dataSource.initialize();
          process.stdout.write('Database connection initialized successfully\n');
          this.logDebug('Database connection initialized successfully');
        }
        
        // Test query to verify connection
        process.stdout.write('Running test query to verify connection...\n');
        this.logDebug('Running test query to verify connection...');
        const result = await this.dataSource.query('SELECT NOW() as time');
        process.stdout.write(`Test query result: ${JSON.stringify(result)}\n`);
        this.logDebug(`Test query result: ${JSON.stringify(result)}`);
        
      } catch (dbError) {
        process.stderr.write(`Database connection error: ${dbError}\n`);
        this.logError('Database connection error', dbError);
        throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }
      
      // Create store
      process.stdout.write('Creating store...\n');
      this.logDebug('Creating store...');
      const store = await this.createStore();
      process.stdout.write(`Store created with ID: ${store?.id || 'unknown'}\n`);
      this.logDebug(`Store created with ID: ${store?.id || 'unknown'}`);
      
      // Create products (with variants and images)
      process.stdout.write('Creating products with variants and images...\n');
      this.logDebug('Creating products with variants and images...');
      const products = await this.createSampleProducts(store);
      process.stdout.write(`Created ${products?.length || 0} products.\n`);
      this.logDebug(`Created ${products?.length || 0} products.`);
      
      // Create profiles
      process.stdout.write('Creating customer profiles...\n');
      this.logDebug('Creating customer profiles...');
      const profiles = await this.createSampleProfiles();
      process.stdout.write(`Created ${profiles?.length || 0} customer profiles.\n`);
      this.logDebug(`Created ${profiles?.length || 0} customer profiles.`);
      
      // Generate orders
      process.stdout.write('Generating orders...\n');
      this.logDebug('Generating orders...');
      await this.generateOrders(store, profiles, products);
      process.stdout.write('Orders generated successfully.\n');
      this.logDebug('Orders generated successfully.');
      
      process.stdout.write('Seed operation completed successfully!\n');
      this.logDebug('Seed operation completed successfully!');
    } catch (error) {
      process.stderr.write(`Error during seed operation: ${error}\n`);
      this.logError('Error during seed operation', error);
      
      // Check for database-specific errors
      if (error.code) {
        process.stderr.write(`Database error code: ${error.code}\n`);
        this.logDebug(`Database error code: ${error.code}`);
      }
      
      // Try to get details about database connection
      try {
        const isConnected = this.dataSource.isInitialized;
        process.stderr.write(`Database connection status during error: ${isConnected ? 'Connected' : 'Not connected'}\n`);
        this.logDebug(`Database connection status during error: ${isConnected ? 'Connected' : 'Not connected'}`);
        
        if (isConnected) {
          try {
            // Check if we can still query
            const result = await this.dataSource.query('SELECT 1 as test');
            process.stdout.write(`Can still run queries: ${JSON.stringify(result)}\n`);
            this.logDebug(`Can still run queries: ${JSON.stringify(result)}`);
          } catch (queryError) {
            process.stderr.write('Cannot run queries despite connection being initialized\n');
            this.logDebug('Cannot run queries despite connection being initialized');
          }
        }
      } catch (connError) {
        process.stderr.write(`Unable to check database connection: ${connError}\n`);
        this.logDebug(`Unable to check database connection: ${connError}`);
      }
      
      throw error;
    }
  }
} 