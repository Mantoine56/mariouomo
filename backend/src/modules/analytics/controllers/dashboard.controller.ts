import { Controller, Get, UseInterceptors, Logger, Query } from '@nestjs/common';
import { CacheHeadersInterceptor } from '../../../common/interceptors/cache-headers.interceptor';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';

/**
 * Dashboard Controller
 * 
 * Provides endpoints for dashboard data and visualizations
 * Used for displaying real-time metrics and analytics data
 */
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly analyticsQueryService: AnalyticsQueryService,
    private readonly realTimeTrackingService: RealTimeTrackingService,
  ) {}

  /**
   * Get dashboard overview data
   * Combines various metrics into a single dashboard response
   * @returns Dashboard overview data with sales, inventory and real-time metrics
   */
  @Get()
  @UseInterceptors(CacheHeadersInterceptor)
  async getDashboardOverview() {
    try {
      // Get sales metrics - use current month as default period
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
      const endDate = now;
      
      const salesMetrics = await this.analyticsQueryService.getSalesOverview(startDate, endDate);
      
      // Get real-time metrics
      const realTimeMetrics = {
        active_users: this.realTimeTrackingService.getActiveUserCount(),
        page_views: Object.fromEntries(this.realTimeTrackingService.getPageViewCounts()),
        traffic_sources: Object.fromEntries(this.realTimeTrackingService.getTrafficSourceDistribution()),
      };

      // Return combined dashboard data
      return {
        sales: salesMetrics,
        real_time: realTimeMetrics,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching dashboard data: ${error.message}`, error.stack);
      return {
        error: 'Failed to load dashboard data',
        message: 'An error occurred while fetching dashboard data',
      };
    }
  }
} 