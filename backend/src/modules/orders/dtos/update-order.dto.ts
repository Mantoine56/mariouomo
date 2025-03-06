import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

/**
 * DTO for updating an existing order
 * Only allows updating specific fields that should be mutable after order creation
 */
export class UpdateOrderDto {
  /**
   * Order status
   */
  @ApiProperty({ 
    description: 'Order status', 
    enum: OrderStatus,
    example: OrderStatus.PROCESSING
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  /**
   * Staff notes for internal use
   * This will be stored in the order metadata
   */
  @ApiProperty({ 
    description: 'Staff notes for internal use', 
    required: false,
    example: 'Customer called to confirm delivery date'
  })
  @IsString()
  @IsOptional()
  staff_notes?: string;

  /**
   * Customer notes for the order
   * This will be stored in the order metadata
   */
  @ApiProperty({ 
    description: 'Customer notes for the order', 
    required: false,
    example: 'Please leave package at the back door'
  })
  @IsString()
  @IsOptional()
  customer_notes?: string;

  /**
   * Additional order metadata
   * Can be used to store any additional information about the order
   */
  @ApiProperty({
    description: 'Additional order metadata',
    required: false,
    example: {
      source: 'admin_panel',
      priority: 'high',
      gift_wrapped: true
    }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
