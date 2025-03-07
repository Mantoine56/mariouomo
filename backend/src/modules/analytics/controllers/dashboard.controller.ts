import { Controller, Get, UseInterceptors, Logger, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CacheHeadersInterceptor } from '../../../common/interceptors/cache-headers.interceptor';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

/**
 * Dashboard Controller
 * 
 * Provides endpoints for dashboard data and visualizations
 * Used for displaying real-time metrics and analytics data
 * 
 * Secured with JWT authentication and role-based access control
 * Only ADMIN and MERCHANT roles can access dashboard data
 */
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Roles(Role.ADMIN, Role.MERCHANT)
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
  @ApiOperation({ 
    summary: 'Get dashboard overview data (Admin and Merchant only)',
    description: 'Provides a comprehensive overview of sales and real-time metrics for the dashboard'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required roles',
  })
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