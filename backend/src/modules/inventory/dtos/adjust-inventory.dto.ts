import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

/**
 * DTO for adjusting inventory quantities
 * Supports both positive and negative adjustments with reason tracking
 */
export class AdjustInventoryDto {
  @ApiProperty({ description: 'Quantity to adjust (positive or negative)' })
  @IsNumber()
  adjustment: number;

  @ApiProperty({ description: 'Reason for the adjustment' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Reference number (e.g., order ID, return ID)' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Notes about the adjustment' })
  @IsString()
  @IsOptional()
  notes?: string;
}
