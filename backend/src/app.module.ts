import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { getDatabaseConfig } from './config/database.config';

// Import modules that exist in the project
import { CachePolicyModule } from './common/cache-policy/cache-policy.module';
import { CorsModule } from './common/cors/cors.module';
import { SeedModule } from './seed/seed.module';

// Import feature modules
// These will be uncommented as they are implemented
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';

/**
 * Main application module
 * 
 * Configures and registers all application modules.
 * Feature modules are added incrementally as they are implemented.
 */
@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    
    // Feature Modules
    AuthModule,
    ProductsModule,
    OrdersModule,
    InventoryModule,
    AnalyticsModule,
    PaymentsModule,
    UsersModule,
    StoresModule,
    ShipmentsModule,
    GiftCardsModule,
    DiscountsModule,
    EventsModule,
    
    // Common Modules
    CorsModule,
    CachePolicyModule,
    
    // Development Modules
    ...(process.env.NODE_ENV !== 'production' ? [SeedModule] : []),
  ],
  providers: [],
})
export class AppModule {}
