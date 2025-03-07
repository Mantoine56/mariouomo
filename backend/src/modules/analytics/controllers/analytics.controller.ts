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
  getSchemaPath,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  SalesMetricsResponseSchema,
  InventoryMetricsResponseSchema,
  CustomerMetricsResponseSchema,
  DateRangeRequestSchema,
  MetricsFilterRequestSchema,
  ApiOperationDescriptions,
  ApiResponseDescriptions,
  SecuritySchemes,
} from './analytics.controller.docs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Public } from '../../auth/decorators/public.decorator';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import {
  SalesAnalyticsResponseDto,
  ErrorResponseDto,
  InventoryAnalyticsResponseDto,
  InventoryErrorResponseDto,
  CustomerAnalyticsResponseDto,
  CustomerErrorResponseDto,
  RealTimeDashboardResponseDto,
  ActiveUsersResponseDto,
  PageViewsResponseDto,
  TrafficSourceDistributionResponseDto,
  RealTimeErrorResponseDto,
  ProductPerformanceResponseDto,
  ProductPerformanceErrorResponseDto,
  CategoryPerformanceResponseDto,
  CategoryPerformanceErrorResponseDto,
} from '../dto';

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
 * Provides data for various analytics visualizations and metrics
 * Supports multi-tenant analytics with store-specific data
 */
@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(
    private readonly analyticsQueryService: AnalyticsQueryService,
    private readonly realTimeTrackingService: RealTimeTrackingService,
  ) {}

  /**
   * Gets sales analytics for a date range
   * Provides comprehensive sales data including revenue, orders, top products, and sales by category
   */
  @Get('sales')
  @ApiOperation({ 
    summary: 'Get sales analytics (Admin only)',
    description: ApiOperationDescriptions.getSalesMetrics
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: Date, 
    required: true,
    description: 'Start date for the analytics period (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: Date, 
    required: true,
    description: 'End date for the analytics period (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'store_id', 
    type: String, 
    required: true,
    description: 'Store ID to get analytics for'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ApiResponseDescriptions.salesMetrics,
    schema: { $ref: getSchemaPath('SalesMetricsResponseSchema') },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ApiResponseDescriptions.badRequest,
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: ApiResponseDescriptions.unauthorized,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ApiResponseDescriptions.forbidden,
  })
  async getSales(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    try {
      // Validate date range before passing to service
      if (startDate > endDate) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date range',
          error: 'Bad Request',
          details: 'Start date must be before end date'
        });
      }
      
      return this.analyticsQueryService.getSalesOverview(startDate, endDate);
    } catch (error) {
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error in getSales controller:', error);
      return {
        error: 'Failed to retrieve sales analytics',
        message: error.message,
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets inventory analytics
   * Provides comprehensive inventory data including stock levels, turnover rates, and inventory value
   */
  @Get('inventory')
  @ApiOperation({ 
    summary: 'Get inventory analytics (Admin only)',
    description: ApiOperationDescriptions.getInventoryMetrics
  })
  @ApiQuery({ 
    name: 'date', 
    type: Date, 
    required: true,
    description: 'Date for inventory snapshot (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'store_id', 
    type: String, 
    required: true,
    description: 'Store ID to get analytics for'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ApiResponseDescriptions.inventoryMetrics,
    schema: { $ref: getSchemaPath('InventoryMetricsResponseSchema') },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ApiResponseDescriptions.badRequest,
    type: InventoryErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: ApiResponseDescriptions.unauthorized,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ApiResponseDescriptions.forbidden,
  })
  async getInventory(
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    try {
      // Validate date is not null
      if (!date || isNaN(date.getTime())) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date',
          error: 'Bad Request',
          details: 'A valid date must be provided'
        });
      }
      
      return this.analyticsQueryService.getInventoryOverview(date);
    } catch (error) {
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error in getInventory controller:', error);
      return {
        error: 'Failed to retrieve inventory analytics',
        message: error.message,
        analysisDate: date
      };
    }
  }

  /**
   * Gets customer analytics
   * Provides comprehensive customer data including acquisition, retention, segments, and traffic sources
   */
  @Get('customers')
  @ApiOperation({ 
    summary: 'Get customer analytics (Admin only)',
    description: 'Retrieves comprehensive customer analytics data for a specified date range, including acquisition metrics, retention rates, customer segments, and traffic sources.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: Date, 
    required: true,
    description: 'Start date for the analytics period (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: Date, 
    required: true,
    description: 'End date for the analytics period (YYYY-MM-DD)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer analytics retrieved successfully',
    type: CustomerAnalyticsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format or date range',
    type: CustomerErrorResponseDto,
  })
  async getCustomers(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    try {
      // Validate date range before passing to service
      if (startDate > endDate) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date range',
          error: 'Bad Request',
          details: 'Start date must be before end date'
        });
      }
      
      return this.analyticsQueryService.getCustomerInsights(startDate, endDate);
    } catch (error) {
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error in getCustomers controller:', error);
      return {
        error: 'Failed to retrieve customer analytics',
        message: error.message,
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets real-time dashboard data
   * Provides current platform metrics including active users, page views, and traffic sources
   */
  @Get('realtime/dashboard')
  @Public()
  @ApiOperation({ 
    summary: 'Get real-time dashboard data',
    description: 'Retrieves current platform metrics including active users, page views, traffic sources, popular products, and cart metrics.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Real-time dashboard data retrieved successfully',
    type: RealTimeDashboardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve real-time dashboard data',
    type: RealTimeErrorResponseDto,
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
   * Provides the current number of active users on the platform
   */
  @Get('active-users')
  @Public()
  @ApiOperation({ 
    summary: 'Get active user count',
    description: 'Retrieves the current number of active users on the platform.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active user count retrieved successfully',
    type: ActiveUsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve active user count',
    type: RealTimeErrorResponseDto,
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
   * Provides view counts for each page on the platform
   */
  @Get('page-views')
  @ApiOperation({ 
    summary: 'Get page view counts (Admin only)',
    description: 'Retrieves view counts for each page on the platform, showing which pages are most popular.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page view counts retrieved successfully',
    type: PageViewsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve page view counts',
    type: RealTimeErrorResponseDto,
  })
  async getPageViews() {
    try {
      const pageViewCounts = this.realTimeTrackingService.getPageViewCounts();
      
      // Convert Map to a more API-friendly format
      const formattedPageViews = Array.from(pageViewCounts.entries()).map(([page, count]) => ({
        page,
        views: count
      }));
      
      return {
        pageViews: formattedPageViews,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getPageViews:', error);
      return {
        error: 'Failed to get page views',
        message: error.message,
        pageViews: []
      };
    }
  }

  /**
   * Gets traffic source distribution
   * Provides breakdown of traffic sources with optional date filtering
   */
  @Get('traffic-sources')
  @Public() // Making this endpoint public for testing purposes
  @ApiOperation({ 
    summary: 'Get traffic source distribution (Public for testing)',
    description: 'Retrieves a breakdown of traffic sources (Google, Facebook, Direct, etc.) with optional date range filtering.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: Date, 
    required: false, 
    description: 'Optional start date for filtering traffic sources (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: Date, 
    required: false, 
    description: 'Optional end date for filtering traffic sources (YYYY-MM-DD)' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Traffic source distribution retrieved successfully',
    type: TrafficSourceDistributionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format',
    type: RealTimeErrorResponseDto,
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
   * Provides detailed performance data for all products including sales, revenue, and conversion rates
   */
  @Get('products/performance')
  @ApiOperation({ 
    summary: 'Get product performance metrics (Admin only)',
    description: 'Retrieves detailed performance data for all products including sales volume, revenue, profit margins, and conversion rates.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: Date, 
    required: true,
    description: 'Start date for the analytics period (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: Date, 
    required: true,
    description: 'End date for the analytics period (YYYY-MM-DD)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product performance metrics retrieved successfully',
    type: ProductPerformanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format or date range',
    type: ProductPerformanceErrorResponseDto,
  })
  async getProductPerformance(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    try {
      // Validate date range before passing to service
      if (startDate > endDate) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date range',
          error: 'Bad Request',
          details: 'Start date must be before end date'
        });
      }
      
      return this.analyticsQueryService.getProductPerformance(startDate, endDate);
    } catch (error) {
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error in getProductPerformance controller:', error);
      return {
        error: 'Failed to retrieve product performance metrics',
        message: error.message,
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets category performance metrics
   * Provides detailed performance data for all product categories including sales, revenue, and growth rates
   */
  @Get('categories/performance')
  @ApiOperation({ 
    summary: 'Get category performance metrics (Admin only)',
    description: 'Retrieves detailed performance data for all product categories including sales volume, revenue, percentage of total sales, and growth rates.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: Date, 
    required: true,
    description: 'Start date for the analytics period (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: Date, 
    required: true,
    description: 'End date for the analytics period (YYYY-MM-DD)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category performance metrics retrieved successfully',
    type: CategoryPerformanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format or date range',
    type: CategoryPerformanceErrorResponseDto,
  })
  async getCategoryPerformance(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    try {
      // Validate date range before passing to service
      if (startDate > endDate) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid date range',
          error: 'Bad Request',
          details: 'Start date must be before end date'
        });
      }
      
      return this.analyticsQueryService.getCategoryPerformance(startDate, endDate);
    } catch (error) {
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error in getCategoryPerformance controller:', error);
      return {
        error: 'Failed to retrieve category performance metrics',
        message: error.message,
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Generates sample real-time metrics data
   * Development-only endpoint to create test data for analytics dashboard
   */
  @Get('generate-sample-data')
  @Public()
  @ApiOperation({ 
    summary: 'Generate sample real-time metrics data (Dev only)',
    description: 'Creates sample data for testing the analytics dashboard. Only available in development environment.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sample data generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Sample data generated successfully' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to generate sample data',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Failed to generate sample data' },
        message: { type: 'string', example: 'Internal server error' }
      }
    }
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
   * Used for monitoring and uptime checks
   */
  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Simple endpoint to verify the API is running and responding. Does not require authentication.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-03-06T20:07:25.000Z' },
        environment: { type: 'string', example: 'development' }
      }
    }
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
