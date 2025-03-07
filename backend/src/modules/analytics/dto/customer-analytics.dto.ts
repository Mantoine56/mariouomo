import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for customer acquisition data
 */
export class CustomerAcquisitionDto {
  @ApiProperty({
    description: 'The time period (date)',
    example: '2025-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Number of new customers',
    example: 42,
  })
  newCustomers: number;

  @ApiProperty({
    description: 'Customer acquisition cost',
    example: 25.50,
  })
  acquisitionCost: number;
}

/**
 * DTO for customer segment data
 */
export class CustomerSegmentDto {
  @ApiProperty({
    description: 'Segment name',
    example: 'Loyal Customers',
    enum: ['New', 'Occasional', 'Regular', 'Loyal', 'VIP'],
  })
  segment: string;

  @ApiProperty({
    description: 'Number of customers in this segment',
    example: 250,
  })
  count: number;

  @ApiProperty({
    description: 'Percentage of total customers',
    example: 25.5,
  })
  percentage: number;

  @ApiProperty({
    description: 'Average lifetime value of customers in this segment',
    example: 750.25,
  })
  averageLifetimeValue: number;
}

/**
 * DTO for customer retention data
 */
export class CustomerRetentionDto {
  @ApiProperty({
    description: 'The time period (month)',
    example: 'January 2025',
  })
  period: string;

  @ApiProperty({
    description: 'Retention rate as percentage',
    example: 85.5,
  })
  retentionRate: number;

  @ApiProperty({
    description: 'Churn rate as percentage',
    example: 14.5,
  })
  churnRate: number;
}

/**
 * DTO for traffic source data
 */
export class TrafficSourceDto {
  @ApiProperty({
    description: 'Traffic source name',
    example: 'Google',
    enum: ['Google', 'Facebook', 'Instagram', 'Direct', 'Email', 'Referral', 'Other'],
  })
  source: string;

  @ApiProperty({
    description: 'Number of customers from this source',
    example: 150,
  })
  count: number;

  @ApiProperty({
    description: 'Percentage of total traffic',
    example: 30.5,
  })
  percentage: number;

  @ApiProperty({
    description: 'Conversion rate for this traffic source',
    example: 3.2,
  })
  conversionRate: number;
}

/**
 * DTO for complete customer analytics response
 */
export class CustomerAnalyticsResponseDto {
  @ApiProperty({
    description: 'Total number of customers',
    example: 1250,
  })
  totalCustomers: number;

  @ApiProperty({
    description: 'Number of new customers in the period',
    example: 125,
  })
  newCustomers: number;

  @ApiProperty({
    description: 'Average customer lifetime value',
    example: 550.75,
  })
  averageLifetimeValue: number;

  @ApiProperty({
    description: 'Overall retention rate as percentage',
    example: 78.5,
  })
  retentionRate: number;

  @ApiProperty({
    description: 'Customer acquisition data by time period',
    type: [CustomerAcquisitionDto],
  })
  customerAcquisition: CustomerAcquisitionDto[];

  @ApiProperty({
    description: 'Customer segments breakdown',
    type: [CustomerSegmentDto],
  })
  customerSegments: CustomerSegmentDto[];

  @ApiProperty({
    description: 'Customer retention data by time period',
    type: [CustomerRetentionDto],
  })
  customerRetention: CustomerRetentionDto[];

  @ApiProperty({
    description: 'Traffic sources breakdown',
    type: [TrafficSourceDto],
  })
  trafficSources: TrafficSourceDto[];

  @ApiProperty({
    description: 'Date range for the analytics',
    example: {
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-31T23:59:59.999Z',
    },
  })
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * DTO for customer analytics error response
 */
export class CustomerErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Failed to retrieve customer analytics',
  })
  error: string;

  @ApiProperty({
    description: 'Detailed error message',
    example: 'Database connection error',
  })
  message: string;

  @ApiProperty({
    description: 'Date range that was requested',
    example: {
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-31T23:59:59.999Z',
    },
  })
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
