import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for redeeming a gift card
 */
export class RedeemGiftCardDto {
  @ApiProperty({ description: 'Gift card code to redeem' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Amount to redeem from the gift card' })
  @IsNumber()
  @Min(0)
  amount: number;
}
