import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';

/**
 * Controller for analytics dashboard endpoints
 * Provides data for various analytics visualizations
 */
@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(
    private readonly analyticsQueryService: AnalyticsQueryService,
    private readonly realTimeTrackingService: RealTimeTrackingService,
  ) {}

  /**
   * Custom pipe for parsing date strings into Date objects
   */
  @Injectable()
  static class ParseDatePipe implements PipeTransform<string, Date> {
    transform(value: string, metadata: ArgumentMetadata): Date {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return date;
    }
  }

  /**
   * Gets sales overview for a date range
   */
  @Get('sales/overview')
  @ApiOperation({ summary: 'Get sales overview (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales overview retrieved successfully',
  })
  async getSalesOverview(
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getSalesOverview(startDate, endDate);
  }

  /**
   * Gets sales overview for a date range
   */
  @Get('sales')
  @ApiOperation({ summary: 'Get sales overview (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales overview retrieved successfully',
  })
  async getSales(
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getSalesOverview(startDate, endDate);
  }

  /**
   * Gets inventory overview
   */
  @Get('inventory/overview')
  @ApiOperation({ summary: 'Get inventory overview (Admin only)' })
  @ApiQuery({ name: 'date', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory overview retrieved successfully',
  })
  async getInventoryOverview(
    @Query('date', AnalyticsController.ParseDatePipe) date: Date,
  ) {
    return this.analyticsQueryService.getInventoryOverview(date);
  }

  /**
   * Gets inventory overview
   */
  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory overview (Admin only)' })
  @ApiQuery({ name: 'date', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory overview retrieved successfully',
  })
  async getInventory(
    @Query('date', AnalyticsController.ParseDatePipe) date: Date,
  ) {
    return this.analyticsQueryService.getInventoryOverview(date);
  }

  /**
   * Gets customer insights
   */
  @Get('customers/insights')
  @ApiOperation({ summary: 'Get customer insights (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer insights retrieved successfully',
  })
  async getCustomerInsights(
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getCustomerInsights(startDate, endDate);
  }

  /**
   * Gets customer insights
   */
  @Get('customers')
  @ApiOperation({ summary: 'Get customer insights (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer insights retrieved successfully',
  })
  async getCustomers(
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getCustomerInsights(startDate, endDate);
  }

  /**
   * Gets real-time dashboard data
   */
  @Get('realtime/dashboard')
  @ApiOperation({ summary: 'Get real-time dashboard data (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Real-time dashboard data retrieved successfully',
  })
  async getRealTimeDashboard() {
    return this.analyticsQueryService.getRealTimeDashboard();
  }

  /**
   * Gets real-time dashboard data
   */
  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time dashboard data (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Real-time dashboard data retrieved successfully',
  })
  async getRealTime() {
    return this.analyticsQueryService.getRealTimeDashboard();
  }

  /**
   * Gets product performance metrics
   */
  @Get('products/:id/performance')
  @ApiOperation({ summary: 'Get product performance metrics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product performance metrics retrieved successfully',
  })
  async getProductPerformance(
    @Query('id', ParseUUIDPipe) productId: string,
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getProductPerformance(
      productId,
      startDate,
      endDate,
    );
  }

  /**
   * Gets category performance metrics
   */
  @Get('categories/:id/performance')
  @ApiOperation({ summary: 'Get category performance metrics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category performance metrics retrieved successfully',
  })
  async getCategoryPerformance(
    @Query('id', ParseUUIDPipe) categoryId: string,
    @Query('startDate', AnalyticsController.ParseDatePipe) startDate: Date,
    @Query('endDate', AnalyticsController.ParseDatePipe) endDate: Date,
  ) {
    return this.analyticsQueryService.getCategoryPerformance(
      categoryId,
      startDate,
      endDate,
    );
  }

  /**
   * Gets active user count
   */
  @Get('realtime/users')
  @ApiOperation({ summary: 'Get active user count (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active user count retrieved successfully',
  })
  getActiveUserCount() {
    return {
      count: this.realTimeTrackingService.getActiveUserCount(),
    };
  }

  /**
   * Gets active user count
   */
  @Get('active-users')
  @ApiOperation({ summary: 'Get active user count (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active user count retrieved successfully',
  })
  getActiveUsers() {
    return {
      count: this.realTimeTrackingService.getActiveUserCount(),
    };
  }

  /**
   * Gets page view distribution
   */
  @Get('realtime/pageviews')
  @ApiOperation({ summary: 'Get page view distribution (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page view distribution retrieved successfully',
  })
  getPageViewDistribution() {
    return {
      views: Object.fromEntries(this.realTimeTrackingService.getPageViewCounts()),
    };
  }

  /**
   * Gets page view distribution
   */
  @Get('page-views')
  @ApiOperation({ summary: 'Get page view distribution (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page view distribution retrieved successfully',
  })
  getPageViews() {
    return {
      views: Object.fromEntries(this.realTimeTrackingService.getPageViewCounts()),
    };
  }

  /**
   * Gets traffic source distribution
   */
  @Get('realtime/traffic')
  @ApiOperation({ summary: 'Get traffic source distribution (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Traffic source distribution retrieved successfully',
  })
  getTrafficSourceDistribution() {
    return {
      sources: Object.fromEntries(
        this.realTimeTrackingService.getTrafficSourceDistribution(),
      ),
    };
  }
}
