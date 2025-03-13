import { IsOptional, IsString, IsNumber, IsEnum, IsUUID, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum for product sort fields
 */
export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

/**
 * Enum for sort order
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Enum for product status
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Data Transfer Object for searching products
 */
export class SearchProductsDto {
  /**
   * Search query for full-text search
   */
  @ApiProperty({
    description: 'Search query for full-text search',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  /**
   * Filter by store ID
   */
  @ApiProperty({
    description: 'Filter products by store ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  /**
   * Filter by product status
   */
  @ApiProperty({
    description: 'Filter products by status',
    required: false,
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  /**
   * Filter by category IDs
   */
  @ApiProperty({
    description: 'Filter products by category IDs',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsUUID(undefined, { each: true })
  categories?: string[];

  /**
   * Minimum price filter
   */
  @ApiProperty({
    description: 'Minimum price filter',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  /**
   * Maximum price filter
   */
  @ApiProperty({
    description: 'Maximum price filter',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  /**
   * Field to sort by
   */
  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    enum: ProductSortField,
    default: ProductSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortField)
  sortBy?: ProductSortField = ProductSortField.CREATED_AT;

  /**
   * Sort order (ASC or DESC)
   */
  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
  
  /**
   * Page number for pagination
   */
  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * Number of items per page
   */
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
