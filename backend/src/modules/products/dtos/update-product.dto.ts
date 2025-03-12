import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from './create-product.dto';
import { UpdateProductVariantDto } from './update-product-variant.dto';

/**
 * DTO for updating an existing product
 */
export class UpdateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiProperty({ description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ description: 'Product status', enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
  
  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
  
  @ApiProperty({ description: 'Compare-at price for showing discounted pricing', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  compare_at_price?: number;
  
  @ApiProperty({ description: 'Cost price for profit calculations', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_price?: number;
  
  @ApiProperty({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
  
  @ApiProperty({ description: 'Product variants' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  variants?: UpdateProductVariantDto[];
  
  @ApiProperty({ description: 'Category IDs to assign to this product' })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  category_ids?: string[];
} 