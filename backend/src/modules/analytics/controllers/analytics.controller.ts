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
 * Custom pipe for parsing date strings into Date objects
 */
@Injectable()
class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return date;
  }
}

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
   * Gets sales analytics for a date range
   */
  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales analytics retrieved successfully',
  })
  async getSales(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    return this.analyticsQueryService.getSalesOverview(startDate, endDate);
  }

  /**
   * Gets inventory analytics
   */
  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory analytics (Admin only)' })
  @ApiQuery({ name: 'date', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory analytics retrieved successfully',
  })
  async getInventory(
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return this.analyticsQueryService.getInventoryOverview(date);
  }

  /**
   * Gets customer analytics
   */
  @Get('customers')
  @ApiOperation({ summary: 'Get customer analytics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer analytics retrieved successfully',
  })
  async getCustomers(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
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
    return this.realTimeTrackingService.getCurrentMetrics();
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
  async getActiveUsers() {
    return this.realTimeTrackingService.getActiveUserCount();
  }

  /**
   * Gets page view counts
   */
  @Get('page-views')
  @ApiOperation({ summary: 'Get page view counts (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page view counts retrieved successfully',
  })
  async getPageViews() {
    return this.realTimeTrackingService.getPageViewCounts();
  }

  /**
   * Gets traffic source distribution
   */
  @Get('traffic-sources')
  @ApiOperation({ summary: 'Get traffic source distribution (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Traffic source distribution retrieved successfully',
  })
  async getTrafficSourceDistribution() {
    return this.analyticsQueryService.getTrafficSourceDistribution();
  }

  /**
   * Gets product performance metrics
   */
  @Get('products/performance')
  @ApiOperation({ summary: 'Get product performance metrics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product performance metrics retrieved successfully',
  })
  async getProductPerformance(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    return this.analyticsQueryService.getProductPerformance(startDate, endDate);
  }

  /**
   * Gets category performance metrics
   */
  @Get('categories/performance')
  @ApiOperation({ summary: 'Get category performance metrics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: Date, required: true })
  @ApiQuery({ name: 'endDate', type: Date, required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category performance metrics retrieved successfully',
  })
  async getCategoryPerformance(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    return this.analyticsQueryService.getCategoryPerformance(startDate, endDate);
  }
}
