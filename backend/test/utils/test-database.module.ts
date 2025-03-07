import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from '../../src/config/test-database.config';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Import all entities that need to be included in tests
import { Product } from '../../src/modules/products/entities/product.entity';
import { ProductVariant } from '../../src/modules/products/entities/product-variant.entity';
import { ProductImage } from '../../src/modules/products/entities/product-image.entity';
import { InventoryItem } from '../../src/modules/inventory/entities/inventory-item.entity';
import { Store } from '../../src/modules/stores/entities/store.entity';
import { Category } from '../../src/modules/products/entities/category.entity';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

/**
 * Database module specifically for integration tests
 * Uses the test database configuration with prefixed tables
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
            Product,
            ProductVariant,
            ProductImage,
            InventoryItem,
            Store,
            Category
          ],
          // Disable autoLoadEntities to ensure we only use our explicitly defined entities
          autoLoadEntities: false,
        };
      },
    }),
  ],
})
export class TestDatabaseModule {} 