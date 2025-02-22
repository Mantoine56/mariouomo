import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

/**
 * DTO for validating a discount code
 * Contains cart and customer information needed for validation
 */
export class ValidateDiscountDto {
  @ApiProperty({ description: 'Discount code to validate' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Total cart amount' })
  @IsNumber()
  cart_total: number;

  @ApiProperty({ description: 'Number of previous orders by the customer' })
  @IsNumber()
  @IsOptional()
  previous_orders?: number;

  @ApiProperty({ description: 'Customer group memberships' })
  @IsArray()
  @IsOptional()
  customer_groups?: string[];
}
