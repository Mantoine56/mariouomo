import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsObject, Min } from 'class-validator';

/**
 * DTO for updating inventory quantities and settings
 * Supports partial updates with proper validation
 */
export class UpdateInventoryDto {
  @ApiProperty({ description: 'New quantity in stock' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Minimum stock level before reorder' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorder_point?: number;

  @ApiProperty({ description: 'Target stock level when reordering' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorder_quantity?: number;

  @ApiProperty({ description: 'Additional inventory metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
