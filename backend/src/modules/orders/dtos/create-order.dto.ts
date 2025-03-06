import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  ValidateNested, 
  IsArray, 
  Min, 
  IsUUID,
  IsObject,
  IsNotEmpty
} from 'class-validator';

/**
 * DTO for address information in orders
 * Used for both shipping and billing addresses
 */
export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State/province name' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({ description: 'Additional address details', required: false })
  @IsString()
  @IsOptional()
  additional_details?: string;
}

/**
 * DTO for order items within an order
 */
export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsUUID()
  variant_id: string;

  @ApiProperty({ description: 'Quantity of items to order' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for creating a new order
 * Validates all required order information
 */
export class CreateOrderDto {
  /**
   * Store ID for the order
   */
  @ApiProperty({ description: 'Store ID for the order' })
  @IsUUID()
  store_id: string;

  /**
   * Array of order items
   */
  @ApiProperty({ description: 'Array of order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  /**
   * Shipping address information
   */
  @ApiProperty({ description: 'Shipping address information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  shipping_address?: AddressDto;

  /**
   * Billing address information
   */
  @ApiProperty({ description: 'Billing address information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billing_address?: AddressDto;

  /**
   * Additional order metadata
   * Can include customer notes and other information
   */
  @ApiProperty({ 
    description: 'Additional order metadata', 
    required: false,
    example: {
      customer_notes: 'Please leave at the front door',
      source: 'mobile_app',
      gift: true
    }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
