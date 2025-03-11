import { Controller, Post, Body, UnauthorizedException, Res, HttpStatus, Query, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Response } from 'express';
import { IsString, IsNotEmpty } from 'class-validator';
import { Order } from '../orders/entities/order.entity';
import { Logger } from '@nestjs/common';

/**
 * Request DTO for debug database queries
 */
class DebugQueryDto {
  /**
   * The SQL query to execute
   */
  @IsString()
  @IsNotEmpty()
  query: string;

  /**
   * Debug security key (simple measure to prevent accidental exposure)
   */
  @IsString()
  @IsNotEmpty()
  debugKey: string;
}

/**
 * Development-only controller with debug functionality
 * 
 * These endpoints should NEVER be exposed in production
 * They are intended only for development and debugging
 */
@ApiTags('Development')
@Controller('dev')
export class DevController {
  private readonly logger = new Logger(DevController.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Execute a direct database query for debugging purposes
   * 
   * This endpoint is for development and debugging ONLY
   * It should be disabled or removed in production
   */
  @Post('query-debug')
  @ApiOperation({ summary: 'Execute a direct database query (Debug only)' })
  @ApiBody({ type: DebugQueryDto })
  async executeDebugQuery(
    @Body() queryDto: DebugQueryDto,
    @Res() res: Response,
  ) {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Debug endpoints are not available in production');
    }

    console.log('[DEBUG] Received debug query request:', JSON.stringify(queryDto));

    // Check if queryDto is properly formed
    if (!queryDto || typeof queryDto !== 'object') {
      console.error('[DEBUG] Invalid queryDto:', queryDto);
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Invalid request format',
        received: queryDto
      });
    }

    // Check if query is present
    if (!queryDto.query) {
      console.error('[DEBUG] Missing query in request');
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Query is required',
        received: queryDto
      });
    }

    // Check if debugKey is present
    if (!queryDto.debugKey) {
      console.error('[DEBUG] Missing debugKey in request');
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Debug key is required',
        received: queryDto
      });
    }

    // Simple security check
    if (queryDto.debugKey !== 'DEBUG_ONLY') {
      console.error('[DEBUG] Invalid debug key:', queryDto.debugKey);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Invalid debug key',
        received: queryDto.debugKey
      });
    }

    try {
      // Only allow SELECT queries for safety
      if (!queryDto.query.trim().toUpperCase().startsWith('SELECT')) {
        console.error('[DEBUG] Non-SELECT query attempted:', queryDto.query);
        return res.status(HttpStatus.FORBIDDEN).json({
          error: 'Only SELECT queries are allowed for debugging',
          query: queryDto.query
        });
      }

      // Execute the query
      console.log(`[DEBUG] Executing query: ${queryDto.query}`);
      const result = await this.dataSource.query(queryDto.query);
      console.log('[DEBUG] Query result:', result);

      // Return the result
      return res.status(HttpStatus.OK).json({ result });
    } catch (error) {
      console.error('[DEBUG] Query error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
        query: queryDto.query,
        stack: error.stack
      });
    }
  }

  /**
   * Get debug data without requiring SQL
   */
  @Post('debug-data')
  @ApiOperation({ summary: 'Get debug data without SQL (Debug only)' })
  async getDebugData(
    @Body('debugKey') debugKey: string,
    @Res() res: Response,
  ) {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Debug endpoints are not available in production');
    }

    console.log('[DEBUG] Received debug data request with key:', debugKey);

    // Simple security check
    if (debugKey !== 'DEBUG_ONLY') {
      console.error('[DEBUG] Invalid debug key:', debugKey);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Invalid debug key',
        received: debugKey
      });
    }

    // Generate sample orders
    const sampleOrders = [
      {
        id: 'dedd18f1-ff0a-4e01-9a8a-798af4260384',
        store_id: 'a2af36c3-5054-4f94-b6f9-5846860781cc',
        user_id: '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
        status: 'processing',
        total_amount: '1553.98',
        subtotal_amount: '1425.67',
        tax_amount: '114.05',
        shipping_amount: '14.26',
        discount_amount: '0.00',
        created_at: new Date(2025, 2, 3, 11, 23, 48).toISOString(),
        updated_at: new Date(2025, 2, 3, 11, 23, 48).toISOString(),
      },
      {
        id: 'f08c754e-3a12-48c7-a9e4-fa83c42becca',
        store_id: 'a2af36c3-5054-4f94-b6f9-5846860781cc',
        user_id: '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
        status: 'refunded',
        total_amount: '2177.73',
        subtotal_amount: '2005.26',
        tax_amount: '160.42',
        shipping_amount: '12.05',
        discount_amount: '0.00',
        created_at: new Date(2025, 2, 3, 16, 14, 13).toISOString(),
        updated_at: new Date(2025, 2, 3, 16, 14, 13).toISOString(),
      },
      {
        id: '7472ee7d-b1ef-4e4c-818a-3f823110ae48',
        store_id: 'a2af36c3-5054-4f94-b6f9-5846860781cc',
        user_id: '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
        status: 'processing',
        total_amount: '2055.11',
        subtotal_amount: '1877.22',
        tax_amount: '150.18',
        shipping_amount: '27.71',
        discount_amount: '0.00',
        created_at: new Date(2025, 1, 25, 13, 0, 50).toISOString(),
        updated_at: new Date(2025, 1, 25, 13, 0, 50).toISOString(),
      },
      {
        id: 'af7de4ed-2b88-4f92-b93a-9b8b1d54fa44',
        store_id: 'a2af36c3-5054-4f94-b6f9-5846860781cc',
        user_id: '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
        status: 'refunded',
        total_amount: '254.46',
        subtotal_amount: '232.75',
        tax_amount: '16.29',
        shipping_amount: '5.42',
        discount_amount: '0.00',
        created_at: new Date(2025, 1, 25, 10, 2, 11).toISOString(),
        updated_at: new Date(2025, 1, 25, 10, 2, 11).toISOString(),
      },
      {
        id: 'b3623f81-c97a-4b48-a577-8d242e6bf15a',
        store_id: 'a2af36c3-5054-4f94-b6f9-5846860781cc',
        user_id: '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
        status: 'cancelled',
        total_amount: '4500.74',
        subtotal_amount: '4237.12',
        tax_amount: '236.67',
        shipping_amount: '26.95',
        discount_amount: '0.00',
        created_at: new Date(2025, 1, 23, 1, 48, 22).toISOString(),
        updated_at: new Date(2025, 1, 23, 1, 48, 22).toISOString(),
      }
    ];

    // Return static test data
    return res.status(HttpStatus.OK).json({ 
      result: [
        { count: sampleOrders.length }
      ],
      sampleOrders,
      items: sampleOrders,
      total: sampleOrders.length,
      message: 'Debug data retrieved successfully'
    });
  }

  /**
   * Perform a database connection test
   */
  @Post('test-connection')
  @ApiOperation({ summary: 'Test database connection (Debug only)' })
  async testDatabaseConnection(
    @Body('debugKey') debugKey: string,
    @Res() res: Response,
  ) {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Debug endpoints are not available in production');
    }

    console.log('[DEBUG] Received database connection test request with key:', debugKey);

    // Simple security check
    if (debugKey !== 'DEBUG_ONLY') {
      console.error('[DEBUG] Invalid debug key:', debugKey);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Invalid debug key',
        received: debugKey
      });
    }

    try {
      // Test database connection with a simple query
      console.log('[DEBUG] Testing database connection...');
      const result = await this.dataSource.query('SELECT NOW() as current_time');
      
      console.log('[DEBUG] Database connection successful');
      return res.status(HttpStatus.OK).json({
        connected: true,
        currentTime: result[0].current_time,
        message: 'Database connection successful'
      });
    } catch (error) {
      console.error('[DEBUG] Database connection failed:', error);
      
      // Safely handle the error object to avoid circular references
      const safeError = {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
      };
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        connected: false,
        error: safeError,
        message: 'Database connection failed'
      });
    }
  }

  /**
   * Get orders without authentication for development purposes
   */
  @Post('debug-orders')
  @ApiOperation({ summary: 'Get orders without authentication (Debug only)' })
  async getDebugOrders(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
    @Query('debugKey') debugKey: string,
  ) {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException('Debug endpoints are only available in development mode');
    }

    // Simple security check for development mode
    if (debugKey !== process.env.DEBUG_KEY) {
      throw new UnauthorizedException('Invalid debug key');
    }

    try {
      // Convert pagination parameters to numbers
      const skipNum = parseInt(skip, 10);
      const takeNum = parseInt(take, 10);

      // Validate pagination parameters
      if (isNaN(skipNum)) {
        throw new BadRequestException('Provided "skip" value is not a valid number');
      }
      if (isNaN(takeNum)) {
        throw new BadRequestException('Provided "take" value is not a valid number');
      }

      // Log what we're doing for debugging purposes
      this.logger.log(`Fetching orders with skip=${skipNum}, take=${takeNum} for debug purposes`);

      // Calculate current page based on skip and take
      const page = Math.floor(skipNum / takeNum) + 1;
      
      // Fetch orders from the database
      const [orders, total] = await this.orderRepository.findAndCount({
        skip: skipNum,
        take: takeNum,
        order: { created_at: 'DESC' },
      });

      // If we have orders, return them
      if (orders.length > 0) {
        this.logger.log(`Found ${orders.length} orders, returning real data`);
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / takeNum);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        
        return {
          items: orders,
          total,
          page,
          limit: takeNum,
          totalPages,
          hasNextPage,
          hasPreviousPage
        };
      }

      // If no orders, return sample data
      this.logger.log('No orders found, returning sample data');
      
      // Create sample data
      const sampleOrders = this.createSampleOrders(takeNum);
      const sampleTotal = 100; // Mock total count
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(sampleTotal / takeNum);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      
      return {
        items: sampleOrders,
        total: sampleTotal,
        page,
        limit: takeNum,
        totalPages,
        hasNextPage,
        hasPreviousPage
      };
    } catch (error) {
      this.logger.error(`Error fetching debug orders: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || 
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch debug orders: ${error.message}`);
    }
  }

  private createSampleOrders(count: number) {
    // Generate a specific number of sample orders
    const sampleOrders = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a random date within the last 30 days
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      // Generate a random total amount between 10 and 1000
      const totalAmount = (Math.random() * 990 + 10).toFixed(2);
      
      // Calculate subtotal (90-95% of total)
      const subtotalAmount = (parseFloat(totalAmount) * (0.9 + Math.random() * 0.05)).toFixed(2);
      
      // Calculate tax (5-10% of subtotal)
      const taxAmount = (parseFloat(subtotalAmount) * (0.05 + Math.random() * 0.05)).toFixed(2);
      
      // Calculate shipping (2-5% of subtotal or fixed amount)
      const shippingAmount = (parseFloat(subtotalAmount) * (0.02 + Math.random() * 0.03)).toFixed(2);
      
      // Calculate discount (0-10% of subtotal)
      const discountAmount = (parseFloat(subtotalAmount) * (Math.random() * 0.1)).toFixed(2);
      
      // Randomly select a status
      const statuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Create a sample order
      sampleOrders.push({
        id: `sample-${i}-${Date.now()}`,
        store_id: 'sample-store-id',
        user_id: 'sample-user-id',
        status,
        total_amount: totalAmount,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        created_at: randomDate.toISOString(),
        updated_at: randomDate.toISOString(),
      });
    }
    
    return sampleOrders;
  }
} 