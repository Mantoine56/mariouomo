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
  @ApiProperty({ description: 'Array of order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ description: 'Shipping address information' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shipping_address: AddressDto;

  @ApiProperty({ description: 'Billing address information' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billing_address: AddressDto;

  @ApiProperty({ description: 'Customer notes for the order', required: false })
  @IsString()
  @IsOptional()
  customer_notes?: string;

  @ApiProperty({ description: 'Additional order metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
