import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsBoolean, IsObject, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../entities/discount.entity';

/**
 * DTO for creating a new discount
 * Validates and transforms discount creation data
 */
export class CreateDiscountDto {
  @ApiProperty({ description: 'Name of the discount' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the discount' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Unique discount code' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ enum: DiscountType, description: 'Type of discount' })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ description: 'Value of the discount (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ description: 'Minimum purchase amount required' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimum_purchase?: number;

  @ApiProperty({ description: 'Maximum discount amount allowed' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maximum_discount?: number;

  @ApiProperty({ description: 'Start date of the discount' })
  @Type(() => Date)
  @IsDate()
  starts_at: Date;

  @ApiProperty({ description: 'End date of the discount' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  ends_at?: Date;

  @ApiProperty({ description: 'Maximum number of times this discount can be used' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  usage_limit?: number;

  @ApiProperty({ description: 'Whether the discount is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Additional rules and conditions' })
  @IsObject()
  @IsOptional()
  rules?: {
    customer_eligibility?: {
      new_customers_only?: boolean;
      minimum_previous_orders?: number;
      specific_customer_groups?: string[];
    };
    product_requirements?: {
      minimum_items?: number;
      specific_categories?: string[];
      excluded_products?: string[];
    };
    usage_restrictions?: {
      once_per_customer?: boolean;
      combinable_with_other_discounts?: boolean;
    };
  };
}
