import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      // Analytics entities will be registered here
    ]),
  ],
  controllers: [
    // Analytics controllers will be registered here
  ],
  providers: [
    // Analytics services will be registered here
    // - AnalyticsCollectorService
    // - AnalyticsAggregatorService
    // - AnalyticsQueryService
    // - RealTimeTrackingService
  ],
  exports: [
    // Exported services
  ],
})
export class AnalyticsModule {} 