import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsDevController } from './controllers/analytics-dev.controller';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { RealTimeTrackingService } from './services/real-time-tracking.service';
import { SalesMetrics } from './entities/sales-metrics.entity';
import { InventoryMetrics } from './entities/inventory-metrics.entity';
import { CustomerMetrics } from './entities/customer-metrics.entity';
import { RealTimeMetrics } from './entities/real-time-metrics.entity';

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
  ],
  controllers: [
    // Analytics controllers
    AnalyticsController,
    ...(process.env.NODE_ENV !== 'production' ? [AnalyticsDevController] : []),
  ],
  providers: [
    // Analytics services
    AnalyticsQueryService,
    RealTimeTrackingService,
  ],
  exports: [
    // Exported services
    AnalyticsQueryService,
    RealTimeTrackingService,
  ],
})
export class AnalyticsModule {} 