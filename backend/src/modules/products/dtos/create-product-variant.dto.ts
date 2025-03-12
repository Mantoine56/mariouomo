import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';

/**
 * DTO for creating a new product variant
 */
export class CreateProductVariantDto {
  @ApiProperty({ description: 'Variant name (e.g. "Small", "Red", "XL/Blue")' })
  @IsString()
  name: string;
  
  @ApiProperty({ description: 'Stock Keeping Unit (SKU)' })
  @IsString()
  @IsOptional()
  sku?: string;
  
  @ApiProperty({ description: 'Barcode (UPC, EAN, etc.)' })
  @IsString()
  @IsOptional()
  barcode?: string;
  
  @ApiProperty({ description: 'Price adjustment from the base product price' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price_adjustment?: number;
  
  @ApiProperty({ description: 'Option values (color, size, etc.) in JSON format' })
  @IsOptional()
  option_values?: Record<string, any>;
} 