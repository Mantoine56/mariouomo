import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from '../../src/config/test-database.config';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Import all entities that need to be included in auth tests
import { Profile } from '../../src/modules/users/entities/profile.entity';
import { UserAddress } from '../../src/modules/users/entities/user-address.entity';
import { Address } from '../../src/modules/users/entities/address.entity';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { OrderItem } from '../../src/modules/orders/entities/order-item.entity';
import { Store } from '../../src/modules/stores/entities/store.entity';
import { Category } from '../../src/modules/products/entities/category.entity';
import { Product } from '../../src/modules/products/entities/product.entity';
import { ProductVariant } from '../../src/modules/products/entities/product-variant.entity';
import { ProductImage } from '../../src/modules/products/entities/product-image.entity';
import { InventoryItem as ProductInventoryItem } from '../../src/modules/products/entities/inventory-item.entity';
import { InventoryItem as InventoryModuleItem } from '../../src/modules/inventory/entities/inventory-item.entity';
import { Payment } from '../../src/modules/payments/entities/payment.entity';
import { Shipment } from '../../src/modules/shipments/entities/shipment.entity';
import { Discount } from '../../src/modules/discounts/entities/discount.entity';
import { GiftCard } from '../../src/modules/gift-cards/entities/gift-card.entity';
import { Event } from '../../src/modules/events/entities/event.entity';
import { SalesMetrics } from '../../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../../src/modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../../src/modules/analytics/entities/real-time-metrics.entity';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

/**
 * Database module specifically for authentication integration tests
 * Properly registers all entities needed for authentication testing
 */
@Module({
  imports: [
    // Import ConfigModule to load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    // Import TypeOrmModule with test configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = getTestDatabaseConfig(configService);
        
        // Explicitly specify entities to ensure all relationships are properly loaded
        return {
          ...config,
          entities: [
            // User entities
            Profile,
            UserAddress,
            Address,
            
            // Order entities
            Order,
            OrderItem,
            
            // Store entity
            Store,
            
            // Product entities
            Category,
            Product,
            ProductVariant,
            ProductImage,
            ProductInventoryItem,
            
            // Inventory entity
            InventoryModuleItem,
            
            // Payment and shipment
            Payment,
            Shipment,
            
            // Other entities
            Discount,
            GiftCard,
            Event,
            
            // Analytics entities
            SalesMetrics,
            InventoryMetrics,
            CustomerMetrics,
            RealTimeMetrics
          ],
          // Enable logging for troubleshooting in test environment
          logging: ['error', 'warn', 'schema'],
          // Disable autoLoadEntities to ensure we only use our explicitly defined entities
          autoLoadEntities: false,
        };
      },
    }),
    // Register entities needed for auth tests
    TypeOrmModule.forFeature([
      // Only register the entities we need in tests
      Profile,
      Order,
      Store
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AuthTestDatabaseModule {} 