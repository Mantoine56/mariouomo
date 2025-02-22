import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum for product status
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * DTO for creating a variant
 */
export class CreateProductVariantDto {
  @ApiProperty({ description: 'Name of the variant' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'SKU of the variant' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Price adjustment from base price' })
  @IsNumber()
  @Min(0)
  price_adjustment: number;

  @ApiProperty({ description: 'Weight in grams' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Initial stock quantity' })
  @IsNumber()
  @Min(0)
  initial_stock: number;
}

/**
 * DTO for creating a product
 */
export class CreateProductDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  store_id: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Base price of the product' })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty({ description: 'Product status', enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT;

  @ApiProperty({ description: 'Product type or category' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Product variants' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];

  @ApiProperty({ description: 'Additional product metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
