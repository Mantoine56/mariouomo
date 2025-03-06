import { IsString, IsNumber, IsOptional, IsUUID, Min, IsObject, IsJSON, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for variant option values (e.g., size, color)
 */
export class OptionValueDto {
  /**
   * Option name (e.g., "size", "color")
   */
  @ApiProperty({ description: 'Option name (e.g., "size", "color")' })
  @IsString()
  name: string;

  /**
   * Option value (e.g., "large", "red")
   */
  @ApiProperty({ description: 'Option value (e.g., "large", "red")' })
  @IsString()
  value: string;
}

/**
 * Base DTO for variant data
 */
export class BaseVariantDto {
  /**
   * Variant SKU - unique identifier for this variant
   */
  @ApiProperty({ description: 'Variant SKU', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  /**
   * Barcode for the variant (UPC, EAN, etc.)
   */
  @ApiProperty({ description: 'Barcode (UPC, EAN, etc.)', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  /**
   * Price adjustment from base product price
   */
  @ApiProperty({ description: 'Price adjustment from base product price' })
  @IsNumber()
  @Min(0)
  price_adjustment: number;

  /**
   * Option values for this variant (color, size, etc.)
   */
  @ApiProperty({ 
    description: 'Option values for this variant (color, size, etc.)',
    type: 'object',
    example: { color: 'red', size: 'large' }
  })
  @IsOptional()
  @IsObject()
  option_values?: Record<string, any>;

  /**
   * Position for ordering variants
   */
  @ApiProperty({ description: 'Position for ordering variants', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}

/**
 * DTO for creating a new variant
 */
export class CreateVariantDto extends BaseVariantDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;
}

/**
 * DTO for updating an existing variant
 */
export class UpdateVariantDto extends BaseVariantDto {
  @ApiProperty({ description: 'Variant ID' })
  @IsUUID()
  id: string;
}
