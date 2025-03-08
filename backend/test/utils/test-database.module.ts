import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Import entities needed for tests
import { Product } from '../../src/modules/products/entities/product.entity';
import { ProductVariant } from '../../src/modules/products/entities/product-variant.entity';
import { ProductImage } from '../../src/modules/products/entities/product-image.entity';
import { InventoryItem } from '../../src/modules/inventory/entities/inventory-item.entity';
import { Store } from '../../src/modules/stores/entities/store.entity';
import { Category } from '../../src/modules/products/entities/category.entity';
import { RealTimeMetrics } from '../../src/modules/analytics/entities/real-time-metrics.entity';
import { SalesMetrics } from '../../src/modules/analytics/entities/sales-metrics.entity';
import { CustomerMetrics } from '../../src/modules/analytics/entities/customer-metrics.entity';
import { InventoryMetrics } from '../../src/modules/analytics/entities/inventory-metrics.entity';

// Import our test utility services
import { DbUtilsTestService } from './db-utils-test.service';
import { ShoppingCartTestRepository } from './shopping-cart-test.repository';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

/**
 * Database module specifically for integration tests
 * Uses a separate test database configuration
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
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          schema: configService.get<string>('DATABASE_SCHEMA', 'public'),
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
          
          // Retry configuration for tests
          retryAttempts: configService.get<number>('DATABASE_RETRY_ATTEMPTS', 3),
          retryDelay: configService.get<number>('DATABASE_RETRY_DELAY', 1000),
          
          // Explicitly specify entities to ensure all relationships are properly loaded
          entities: [
            // Product entities
            Product,
            ProductVariant,
            ProductImage,
            
            // Inventory entity
            InventoryItem,
            
            // Store entity
            Store,
            
            // Category entity
            Category,
            
            // Analytics entities
            RealTimeMetrics,
            SalesMetrics,
            CustomerMetrics,
            InventoryMetrics
          ],
          
          // Disable autoLoadEntities to ensure we only use our explicitly defined entities
          autoLoadEntities: false,
        };
      },
    }),
  ],
  providers: [
    // Add our test utility services
    DbUtilsTestService,
    ShoppingCartTestRepository,
    // Provide the services with the expected injection tokens
    {
      provide: 'DbUtilsService',
      useExisting: DbUtilsTestService
    },
    {
      provide: 'ShoppingCartRepository',
      useExisting: ShoppingCartTestRepository
    }
  ],
  exports: [
    TypeOrmModule,
    DbUtilsTestService,
    ShoppingCartTestRepository,
    'DbUtilsService',
    'ShoppingCartRepository'
  ],
})
export class TestDatabaseModule {} 