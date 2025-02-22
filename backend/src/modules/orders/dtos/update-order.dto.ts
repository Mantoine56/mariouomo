import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

/**
 * DTO for updating an existing order
 * Only allows updating specific fields that should be mutable after order creation
 */
export class UpdateOrderDto {
  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ description: 'Staff notes for internal use', required: false })
  @IsString()
  @IsOptional()
  staff_notes?: string;

  @ApiProperty({ description: 'Customer notes for the order', required: false })
  @IsString()
  @IsOptional()
  customer_notes?: string;
}
