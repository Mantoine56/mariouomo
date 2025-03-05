import {
  Controller,
  Get,
  Query,
  HttpStatus,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

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
 * Development controller for analytics dashboard endpoints
 * This controller does NOT require authentication for easier testing
 * DO NOT USE IN PRODUCTION
 */
@ApiTags('Analytics Dev')
@Controller('dev/analytics')
export class AnalyticsDevController {
  /**
   * Gets mock sales analytics data for development
   */
  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics (No auth required for dev)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales analytics retrieved successfully',
  })
  async getSales(
    @Query('startDate') startDate: string = '2025-02-26',
    @Query('endDate') endDate: string = '2025-03-05',
  ) {
    // Generate mock daily revenue data
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dailyRevenue = [];
    
    // Calculate number of days
    const dayCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: 5000 + Math.random() * 3000
      });
    }
    
    // Return mock data matching the frontend expected format
    return {
      total_revenue: 45789.45,
      total_orders: 287,
      average_order_value: 539.33,
      revenue_change_percentage: 12.5,
      orders_change_percentage: 8.3,
      daily_revenue: dailyRevenue
    };
  }

  /**
   * Gets mock customer analytics data for development
   */
  @Get('customers')
  @ApiOperation({ summary: 'Get customer analytics (No auth required for dev)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer analytics retrieved successfully',
  })
  async getCustomers(
    @Query('startDate') startDate: string = '2025-02-26',
    @Query('endDate') endDate: string = '2025-03-05',
  ) {
    // Generate mock daily acquisition data
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dailyAcquisition = [];
    
    // Calculate number of days
    const dayCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      dailyAcquisition.push({
        date: date.toISOString().split('T')[0],
        new_customers: Math.floor(10 + Math.random() * 15),
        returning_customers: Math.floor(15 + Math.random() * 20)
      });
    }
    
    // Return mock data matching the frontend expected format
    return {
      total_customers: 1245,
      new_customers: 87,
      returning_customers: 158,
      customer_growth_rate: 5.2,
      average_customer_value: 245.67,
      daily_acquisition: dailyAcquisition
    };
  }

  /**
   * Gets mock category performance data for development
   */
  @Get('categories/performance')
  @ApiOperation({ summary: 'Get category performance metrics (No auth required for dev)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category performance metrics retrieved successfully',
  })
  async getCategoryPerformance(
    @Query('startDate') startDate: string = '2025-02-26',
    @Query('endDate') endDate: string = '2025-03-05',
  ) {
    // Return mock data matching the frontend expected format
    return {
      categories: [
        {
          name: 'Electronics',
          revenue: 15789.45,
          orders: 87,
          products_count: 32,
          revenue_percentage: 35.2
        },
        {
          name: 'Clothing',
          revenue: 12456.78,
          orders: 134,
          products_count: 56,
          revenue_percentage: 27.8
        },
        {
          name: 'Home & Kitchen',
          revenue: 8765.43,
          orders: 65,
          products_count: 28,
          revenue_percentage: 19.5
        },
        {
          name: 'Books',
          revenue: 4532.12,
          orders: 43,
          products_count: 18,
          revenue_percentage: 10.1
        },
        {
          name: 'Sports',
          revenue: 3321.67,
          orders: 29,
          products_count: 15,
          revenue_percentage: 7.4
        }
      ]
    };
  }

  /**
   * Gets mock product performance data for development
   */
  @Get('products/performance')
  @ApiOperation({ summary: 'Get product performance metrics (No auth required for dev)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product performance metrics retrieved successfully',
  })
  async getProductPerformance(
    @Query('startDate') startDate: string = '2025-02-26',
    @Query('endDate') endDate: string = '2025-03-05',
  ) {
    // Return mock data matching the frontend expected format
    return {
      products: [
        {
          id: 'prod_1',
          name: 'Premium Wireless Headphones',
          category: 'Electronics',
          revenue: 4567.89,
          orders: 23,
          units_sold: 25,
          return_rate: 2.1
        },
        {
          id: 'prod_2',
          name: 'Designer T-Shirt',
          category: 'Clothing',
          revenue: 3456.78,
          orders: 45,
          units_sold: 48,
          return_rate: 4.2
        },
        {
          id: 'prod_3',
          name: 'Smart Home Speaker',
          category: 'Electronics',
          revenue: 2987.65,
          orders: 18,
          units_sold: 19,
          return_rate: 1.5
        },
        {
          id: 'prod_4',
          name: 'Stainless Steel Cookware Set',
          category: 'Home & Kitchen',
          revenue: 2345.67,
          orders: 12,
          units_sold: 12,
          return_rate: 0.0
        },
        {
          id: 'prod_5',
          name: 'Bestselling Novel',
          category: 'Books',
          revenue: 1876.54,
          orders: 32,
          units_sold: 35,
          return_rate: 0.8
        }
      ]
    };
  }
} 