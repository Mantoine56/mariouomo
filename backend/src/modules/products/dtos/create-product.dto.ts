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
import { CreateProductVariantDto } from './create-product-variant.dto';

/**
 * Enum for product status
 */
export enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
  @ApiProperty({ description: 'Store UUID that this product belongs to' })
  @IsUUID(4)
  store_id: string;
  
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;
  
  @ApiProperty({ description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ description: 'Product status', enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT;
  
  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
  
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
  
  @ApiProperty({ description: 'Product variants', type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
  
  @ApiProperty({ description: 'Category IDs to assign to this product' })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  category_ids?: string[];
}
