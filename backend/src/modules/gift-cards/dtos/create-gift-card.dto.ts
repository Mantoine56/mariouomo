import { IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new gift card
 */
export class CreateGiftCardDto {
  @ApiProperty({ description: 'Initial balance of the gift card' })
  @IsNumber()
  @Min(0)
  initial_balance: number;

  @ApiProperty({ description: 'Optional expiration date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expires_at?: Date;

  @ApiProperty({ description: 'Optional purchaser profile ID' })
  @IsOptional()
  @IsNumber()
  purchaser_id?: number;

  @ApiProperty({ description: 'Optional recipient profile ID' })
  @IsOptional()
  @IsNumber()
  recipient_id?: number;
}
