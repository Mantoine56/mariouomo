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
import { AnalyticsMaterializedViewsService } from '../services/analytics-materialized-views.service';

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
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Get optimized sales dashboard data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns sales dashboard data' })
  async getSalesDashboard(
    @Query('storeId', ParseUUIDPipe) storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    try {
      // Parse and validate dates
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
      
      const data = await this.materializedViewsService.getSalesDashboard(
        storeId,
        startDate,
        endDate,
      );
      
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
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Get optimized customer insights data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'trafficSource', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns customer insights data' })
  async getCustomerInsights(
    @Query('storeId', ParseUUIDPipe) storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('trafficSource') trafficSource?: string,
  ) {
    try {
      // Parse and validate dates
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
      
      const data = await this.materializedViewsService.getCustomerInsights(
        storeId,
        startDate,
        endDate,
        trafficSource,
      );
      
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
  @Roles('admin', 'manager', 'analyst', 'inventory')
  @ApiOperation({ summary: 'Get optimized inventory status data' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns inventory status data' })
  async getInventoryStatus(
    @Query('storeId', ParseUUIDPipe) storeId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    try {
      // Parse and validate dates
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
      
      const data = await this.materializedViewsService.getInventoryStatus(
        storeId,
        startDate,
        endDate,
      );
      
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
  @Roles('admin')
  @ApiOperation({ summary: 'Manually refresh materialized views' })
  @ApiResponse({ status: 200, description: 'Views refreshed successfully' })
  async refreshMaterializedViews() {
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
  @Roles('admin')
  @ApiOperation({ summary: 'Manually trigger data aggregation' })
  @ApiResponse({ status: 200, description: 'Data aggregation triggered successfully' })
  async triggerDataAggregation() {
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
  @Roles('admin')
  @ApiOperation({ summary: 'Manually apply data retention policy' })
  @ApiResponse({ status: 200, description: 'Data retention policy applied successfully' })
  async applyDataRetentionPolicy() {
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
