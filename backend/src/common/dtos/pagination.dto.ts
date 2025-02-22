import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum for sorting direction
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Base pagination query parameters
 * Used for paginated endpoints across the application
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.ASC,
    required: false,
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.ASC;

  @ApiProperty({
    description: 'Search query',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

/**
 * Generic paginated response wrapper
 * Used to wrap paginated data with metadata
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPreviousPage: boolean;
}
