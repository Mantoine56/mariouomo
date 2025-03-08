import {
  Controller,
  Get,
  Query,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { 
  AnalyticsMaterializedViewsService, 
  SalesDashboardData, 
  CustomerInsightsData, 
  InventoryStatusData 
} from '../services/analytics-materialized-views.service';
import { Role } from '../../auth/enums/role.enum';

/**
 * Controller for optimized analytics endpoints using materialized views
 * Provides high-performance dashboard data access
 */
@ApiTags('Analytics - Optimized')
@Controller('analytics/optimized')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsOptimizedController {
  private readonly logger = new Logger(AnalyticsOptimizedController.name);

  constructor(
    private readonly materializedViewsService: AnalyticsMaterializedViewsService,
  ) {}

  /**
   * Get optimized sales dashboard data
   * Uses materialized views for better performance
   */
  @Get('sales-dashboard')
  @ApiOperation({ summary: 'Get optimized sales dashboard data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns sales dashboard data' })
  @Roles(Role.ADMIN, Role.MERCHANT)
  async getSalesDashboard(
    @Query('storeId') storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<{ success: boolean; data: SalesDashboardData[] }> {
    try {
      // Parse the date strings to Date objects
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      const data = await this.materializedViewsService.getSalesDashboard(storeId, startDate, endDate);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Error in getSalesDashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get optimized customer insights data
   * Uses materialized views for better performance
   */
  @Get('customer-insights')
  @ApiOperation({ summary: 'Get optimized customer insights data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'trafficSource', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns customer insights data' })
  @Roles(Role.ADMIN, Role.MERCHANT)
  async getCustomerInsights(
    @Query('storeId') storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('trafficSource') trafficSource: string,
  ): Promise<{ success: boolean; data: CustomerInsightsData[] }> {
    try {
      // Parse the date strings to Date objects
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      const data = await this.materializedViewsService.getCustomerInsights(storeId, startDate, endDate, trafficSource);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Error in getCustomerInsights: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get optimized inventory status data
   * Uses materialized views for better performance
   */
  @Get('inventory-status')
  @ApiOperation({ summary: 'Get optimized inventory status data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns inventory status data' })
  @Roles(Role.ADMIN, Role.MERCHANT)
  async getInventoryStatus(
    @Query('storeId') storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<{ success: boolean; data: InventoryStatusData[] }> {
    try {
      // Parse the date strings to Date objects
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      const data = await this.materializedViewsService.getInventoryStatus(storeId, startDate, endDate);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(`Error in getInventoryStatus: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually refresh materialized views
   * Admin-only endpoint for forcing view refresh
   */
  @Post('refresh-views')
  @ApiOperation({ summary: 'Manually refresh materialized views' })
  @ApiResponse({ status: 200, description: 'Views refreshed successfully' })
  @Roles(Role.ADMIN)
  async refreshViews() {
    try {
      await this.materializedViewsService.refreshMaterializedViews();
      return {
        success: true,
        message: 'Materialized views refreshed successfully',
      };
    } catch (error) {
      this.logger.error(`Error refreshing materialized views: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually trigger data aggregation
   * Admin-only endpoint for forcing data aggregation
   */
  @Post('aggregate-data')
  @ApiOperation({ summary: 'Manually trigger data aggregation' })
  @ApiResponse({ status: 200, description: 'Data aggregation triggered successfully' })
  @Roles(Role.ADMIN)
  async aggregateData() {
    try {
      await this.materializedViewsService.triggerDataAggregation();
      return {
        success: true,
        message: 'Data aggregation triggered successfully',
      };
    } catch (error) {
      this.logger.error(`Error triggering data aggregation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually apply data retention policy
   * Admin-only endpoint for forcing data cleanup
   */
  @Post('apply-retention-policy')
  @ApiOperation({ summary: 'Manually apply data retention policy' })
  @ApiResponse({ status: 200, description: 'Data retention policy applied successfully' })
  @Roles(Role.ADMIN)
  async applyRetentionPolicy() {
    try {
      await this.materializedViewsService.applyDataRetentionPolicy();
      return {
        success: true,
        message: 'Data retention policy applied successfully',
      };
    } catch (error) {
      this.logger.error(`Error applying data retention policy: ${error.message}`, error.stack);
      throw error;
    }
  }
}
