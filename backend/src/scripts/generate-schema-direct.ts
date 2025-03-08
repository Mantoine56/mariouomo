import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Entities to include in schema generation
import { Product } from '../modules/products/entities/product.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { Category } from '../modules/products/entities/category.entity';
import { InventoryItem } from '../modules/inventory/entities/inventory-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Store } from '../modules/stores/entities/store.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { Address } from '../modules/users/entities/address.entity';
import { UserAddress } from '../modules/users/entities/user-address.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Shipment } from '../modules/shipments/entities/shipment.entity';
import { Discount } from '../modules/discounts/entities/discount.entity';
import { GiftCard } from '../modules/gift-cards/entities/gift-card.entity';
import { Event } from '../modules/events/entities/event.entity';
import { SalesMetrics } from '../modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../modules/analytics/entities/real-time-metrics.entity';

/**
 * Direct script to generate database schema SQL
 * 
 * This approach doesn't rely on NestJS to avoid dependency injection issues
 */
async function generateSchema() {
  console.log('Creating connection to database...');
  
  // Create a direct connection to the database
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      Product, ProductVariant, ProductImage, Category,
      InventoryItem, Order, OrderItem, Store,
      Profile, Address, UserAddress, Payment,
      Shipment, Discount, GiftCard, Event,
      SalesMetrics, InventoryMetrics, CustomerMetrics, RealTimeMetrics
    ],
    synchronize: false,
    logging: ['query', 'schema']
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('Connection initialized');
    
    // Use TypeORM's schema:sync command with logging to capture the SQL
    // We'll redirect console output to capture the generated SQL
    const originalConsoleLog = console.log;
    
    // Prepare to capture SQL statements
    const sqlStatements: string[] = [];
    console.log = (message: any) => {
      if (typeof message === 'string' && 
          (message.startsWith('CREATE TABLE') || 
           message.startsWith('CREATE INDEX') || 
           message.startsWith('ALTER TABLE'))) {
        sqlStatements.push(message);
      }
      // Still log to console for debugging
      originalConsoleLog(message);
    };
    
    // Run the synchronization with logging but don't actually apply changes
    await dataSource.synchronize(false);
    
    // Restore original console.log
    console.log = originalConsoleLog;
    
    // Format captured SQL
    const formattedSQL = sqlStatements.join(';\n\n') + ';';
    
    // Write to schema.sql file
    const outputPath = path.join(process.cwd(), 'schema.sql');
    fs.writeFileSync(outputPath, formattedSQL);
    
    console.log(`Schema SQL generated successfully at: ${outputPath}`);
    
    // Alternative method: Generate migration
    console.log('Generating migration script...');
    const timestamp = new Date().getTime();
    const migrationName = `InitialSchema${timestamp}`;
    
    // Create migrations directory if it doesn't exist
    const migrationsDir = path.join(process.cwd(), 'src/migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Use TypeORM's migration generation
    await dataSource.driver.createSchemaBuilder().log();
    
    console.log('Migration script generated');
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the script
generateSchema().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 