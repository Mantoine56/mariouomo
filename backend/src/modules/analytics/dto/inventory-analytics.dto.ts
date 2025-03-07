import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for inventory level data
 */
export class InventoryLevelDto {
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
    description: 'Current stock level',
    example: 25,
  })
  currentStock: number;

  @ApiProperty({
    description: 'Reorder threshold',
    example: 10,
  })
  reorderThreshold: number;

  @ApiProperty({
    description: 'Stock status (Low, Medium, High)',
    example: 'Medium',
    enum: ['Low', 'Medium', 'High'],
  })
  stockStatus: string;
}

/**
 * DTO for inventory turnover data
 */
export class InventoryTurnoverDto {
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
    description: 'Turnover rate (times per year)',
    example: 4.5,
  })
  turnoverRate: number;

  @ApiProperty({
    description: 'Days of inventory on hand',
    example: 81,
  })
  daysOnHand: number;
}

/**
 * DTO for inventory value data
 */
export class InventoryValueDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Outerwear',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Total inventory value',
    example: 12500.75,
  })
  inventoryValue: number;

  @ApiProperty({
    description: 'Percentage of total inventory value',
    example: 35.5,
  })
  percentage: number;
}

/**
 * DTO for complete inventory analytics response
 */
export class InventoryAnalyticsResponseDto {
  @ApiProperty({
    description: 'Total inventory value',
    example: 35000.50,
  })
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Average turnover rate',
    example: 3.2,
  })
  averageTurnoverRate: number;

  @ApiProperty({
    description: 'Number of products with low stock',
    example: 5,
  })
  lowStockCount: number;

  @ApiProperty({
    description: 'Number of products out of stock',
    example: 2,
  })
  outOfStockCount: number;

  @ApiProperty({
    description: 'Inventory levels by product',
    type: [InventoryLevelDto],
  })
  inventoryLevels: InventoryLevelDto[];

  @ApiProperty({
    description: 'Inventory turnover data',
    type: [InventoryTurnoverDto],
  })
  inventoryTurnover: InventoryTurnoverDto[];

  @ApiProperty({
    description: 'Inventory value by category',
    type: [InventoryValueDto],
  })
  inventoryValueByCategory: InventoryValueDto[];

  @ApiProperty({
    description: 'Analysis date',
    example: '2025-01-31T00:00:00.000Z',
  })
  analysisDate: Date;
}

/**
 * DTO for inventory analytics error response
 */
export class InventoryErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Failed to retrieve inventory analytics',
  })
  error: string;

  @ApiProperty({
    description: 'Detailed error message',
    example: 'Database connection error',
  })
  message: string;

  @ApiProperty({
    description: 'Analysis date that was requested',
    example: '2025-01-31T00:00:00.000Z',
  })
  analysisDate?: Date;
}
