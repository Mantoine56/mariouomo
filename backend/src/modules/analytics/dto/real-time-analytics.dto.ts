import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for page view data
 */
export class PageViewDto {
  @ApiProperty({
    description: 'Page URL or path',
    example: '/products/mens-clothing',
  })
  page: string;

  @ApiProperty({
    description: 'Number of views',
    example: 42,
  })
  views: number;
}

/**
 * DTO for traffic source data in real-time
 */
export class RealTimeTrafficSourceDto {
  @ApiProperty({
    description: 'Traffic source name',
    example: 'Google',
    enum: ['Google', 'Facebook', 'Instagram', 'Direct', 'Email', 'Referral', 'Other'],
  })
  source: string;

  @ApiProperty({
    description: 'Number of active sessions from this source',
    example: 25,
  })
  sessions: number;

  @ApiProperty({
    description: 'Percentage of total traffic',
    example: 35.5,
  })
  percentage: number;
}

/**
 * DTO for popular product in real-time
 */
export class PopularProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Leather Jacket',
  })
  productName: string;

  @ApiProperty({
    description: 'Number of views in the current period',
    example: 75,
  })
  views: number;

  @ApiProperty({
    description: 'Number of add-to-cart actions',
    example: 12,
  })
  addToCartCount: number;
}

/**
 * DTO for cart metrics
 */
export class CartMetricsDto {
  @ApiProperty({
    description: 'Number of active carts',
    example: 35,
  })
  activeCarts: number;

  @ApiProperty({
    description: 'Average cart value',
    example: 125.50,
  })
  averageValue: number;

  @ApiProperty({
    description: 'Abandonment rate as percentage',
    example: 65.5,
  })
  abandonmentRate: number;
}

/**
 * DTO for real-time dashboard response
 */
export class RealTimeDashboardResponseDto {
  @ApiProperty({
    description: 'Number of active users',
    example: 125,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Total page views in current period',
    example: 450,
  })
  pageViews: number;

  @ApiProperty({
    description: 'Page view data by page',
    type: [PageViewDto],
  })
  pageViewsByPage: PageViewDto[];

  @ApiProperty({
    description: 'Traffic sources breakdown',
    type: [RealTimeTrafficSourceDto],
  })
  trafficSources: RealTimeTrafficSourceDto[];

  @ApiProperty({
    description: 'Currently popular products',
    type: [PopularProductDto],
  })
  popularProducts: PopularProductDto[];

  @ApiProperty({
    description: 'Current cart metrics',
    type: CartMetricsDto,
  })
  cartMetrics: CartMetricsDto;

  @ApiProperty({
    description: 'Timestamp of the data',
    example: '2025-03-06T20:07:25.000Z',
  })
  timestamp: string;
}

/**
 * DTO for active users response
 */
export class ActiveUsersResponseDto {
  @ApiProperty({
    description: 'Number of active users',
    example: 125,
  })
  activeUsers: number;
}

/**
 * DTO for page views response
 */
export class PageViewsResponseDto {
  @ApiProperty({
    description: 'Page view data by page',
    type: [PageViewDto],
  })
  pageViews: PageViewDto[];

  @ApiProperty({
    description: 'Timestamp of the data',
    example: '2025-03-06T20:07:25.000Z',
  })
  timestamp: string;
}

/**
 * DTO for traffic source distribution response
 */
export class TrafficSourceDistributionResponseDto {
  @ApiProperty({
    description: 'Traffic sources breakdown',
    type: [RealTimeTrafficSourceDto],
  })
  trafficSources: RealTimeTrafficSourceDto[];

  @ApiProperty({
    description: 'Date range for the analytics (if provided)',
    example: {
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-31T23:59:59.999Z',
    },
    required: false,
  })
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * DTO for real-time analytics error response
 */
export class RealTimeErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Failed to retrieve real-time analytics',
  })
  error: string;

  @ApiProperty({
    description: 'Detailed error message',
    example: 'Internal server error',
  })
  message: string;
}
