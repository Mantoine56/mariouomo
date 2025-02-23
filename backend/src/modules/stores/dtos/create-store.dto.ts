import { IsNotEmpty, IsString, IsOptional, IsObject, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new store
 */
export class CreateStoreDto {
  @ApiProperty({ description: 'Store name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Store description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Store status', enum: ['active', 'inactive', 'suspended'] })
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'])
  status: string;

  @ApiPropertyOptional({ description: 'Store settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Store metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
