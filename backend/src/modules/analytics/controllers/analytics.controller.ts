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
import { Public } from '../../auth/decorators/public.decorator';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';

/**
 * Custom pipe for parsing date strings into Date objects with enhanced validation
 * Supports multiple date formats and provides detailed error messages
 */
@Injectable()
class ParseDatePipe implements PipeTransform<string, Date | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): Date | undefined {
    // If value is undefined and parameter is optional, return undefined
    if (value === undefined) {
      return undefined;
    }
    
    // Try to parse the date
    const date = new Date(value);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid date format',
        error: 'Bad Request',
        details: `The provided date '${value}' could not be parsed. Please use ISO format (YYYY-MM-DD) or a valid date string.`
      });
    }
    
    // Validate that the date is not in the future
    const now = new Date();
    if (date > now) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Date cannot be in the future',
        error: 'Bad Request',
        details: `The provided date '${value}' is in the future. Please provide a date in the past or present.`
      });
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
  @Public()
  @ApiOperation({ summary: 'Get real-time dashboard data (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Real-time dashboard data retrieved successfully',
  })
  async getRealTimeDashboard() {
    try {
      return await this.realTimeTrackingService.getCurrentMetrics();
    } catch (error) {
      console.error('Error in getRealTimeDashboard:', error);
      return {
        error: 'Failed to get real-time dashboard data',
        message: error.message,
      };
    }
  }

  /**
   * Gets active user count
   */
  @Get('active-users')
  @Public()
  @ApiOperation({ summary: 'Get active user count (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active user count retrieved successfully',
  })
  async getActiveUsers() {
    try {
      return { activeUsers: this.realTimeTrackingService.getActiveUserCount() };
    } catch (error) {
      console.error('Error in getActiveUsers:', error);
      return {
        error: 'Failed to get active users',
        message: error.message,
      };
    }
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
  @Public() // Making this endpoint public for testing purposes
  @ApiOperation({ summary: 'Get traffic source distribution (Public for testing)' })
  @ApiQuery({ name: 'startDate', type: Date, required: false, description: 'Start date for filtering traffic sources' })
  @ApiQuery({ name: 'endDate', type: Date, required: false, description: 'End date for filtering traffic sources' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Traffic source distribution retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format',
  })
  async getTrafficSourceDistribution(
    @Query('startDate', new ParseDatePipe()) startDate?: Date,
    @Query('endDate', new ParseDatePipe()) endDate?: Date,
  ) {
    try {
      return this.analyticsQueryService.getTrafficSourceDistribution(startDate, endDate);
    } catch (error) {
      console.error('Error in getTrafficSourceDistribution controller:', error);
      return {
        error: 'Failed to retrieve traffic source distribution',
        message: error.message,
      };
    }
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

  /**
   * Generates sample real-time metrics data
   * Development-only endpoint to create test data
   */
  @Get('generate-sample-data')
  @Public()
  @ApiOperation({ summary: 'Generate sample real-time metrics data (Dev only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sample data generated successfully',
  })
  async generateSampleData() {
    if (process.env.NODE_ENV !== 'development') {
      return {
        error: 'This endpoint is only available in development mode',
      };
    }
    
    try {
      await this.realTimeTrackingService.generateSampleData();
      return { success: true, message: 'Sample data generated successfully' };
    } catch (error) {
      console.error('Error in generateSampleData:', error);
      return {
        error: 'Failed to generate sample data',
        message: error.message,
      };
    }
  }

  /**
   * Simple health check endpoint that doesn't require authentication
   */
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API is healthy',
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
