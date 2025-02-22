import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, IsObject } from 'class-validator';

/**
 * DTO for creating a new inventory item
 * Validates all required inventory information
 */
export class CreateInventoryDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsUUID()
  variant_id: string;

  @ApiProperty({ description: 'Stock location/warehouse' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Initial quantity in stock' })
  @IsNumber()
  @Min(0)
  quantity: number;

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
