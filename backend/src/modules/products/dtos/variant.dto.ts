import { IsString, IsNumber, IsOptional, IsUUID, Min, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for variant attributes (e.g., size, color)
 */
export class VariantAttributeDto {
  @ApiProperty({ description: 'Attribute name (e.g., "size", "color")' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Attribute value (e.g., "large", "red")' })
  @IsString()
  value: string;
}

/**
 * Base DTO for variant data
 */
export class BaseVariantDto {
  @ApiProperty({ description: 'Variant SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Variant price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Variant attributes' })
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];

  @ApiProperty({ description: 'Available quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Low stock threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({ description: 'Variant weight in grams' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Variant dimensions in cm (length x width x height)' })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
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
