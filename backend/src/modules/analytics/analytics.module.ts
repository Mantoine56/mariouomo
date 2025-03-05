import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsDevController } from './controllers/analytics-dev.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { RealTimeTrackingService } from './services/real-time-tracking.service';
import { AnalyticsAggregatorService } from './services/analytics-aggregator.service';
import { SalesMetrics } from './entities/sales-metrics.entity';
import { InventoryMetrics } from './entities/inventory-metrics.entity';
import { CustomerMetrics } from './entities/customer-metrics.entity';
import { RealTimeMetrics } from './entities/real-time-metrics.entity';
import { DatabaseModule } from '../../common/database/database.module';
import { CartsModule } from '../carts/carts.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Analytics Module
 * 
 * Manages analytics-related functionality including:
 * - Sales metrics and reporting
 * - Inventory turnover analysis
 * - Customer behavior tracking
 * - Real-time dashboard metrics
 * - Product performance analytics
 * - Category analytics and insights
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Analytics entities
      SalesMetrics,
      InventoryMetrics,
      CustomerMetrics,
      RealTimeMetrics,
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CartsModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL', 60) * 1000, // milliseconds
        max: configService.get<number>('CACHE_MAX_ITEMS', 100), // maximum number of items in cache
      }),
    }),
  ],
  controllers: [
    // Analytics controllers
    AnalyticsController,
    DashboardController,
    ...(process.env.NODE_ENV !== 'production' ? [AnalyticsDevController] : []),
  ],
  providers: [
    // Analytics services
    AnalyticsQueryService,
    RealTimeTrackingService,
    AnalyticsAggregatorService,
  ],
  exports: [
    // Exported services
    AnalyticsQueryService,
    RealTimeTrackingService,
    AnalyticsAggregatorService,
  ],
})
export class AnalyticsModule {} 