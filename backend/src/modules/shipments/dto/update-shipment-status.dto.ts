import { IsEnum, IsOptional, ValidateNested, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '../enums/shipment-status.enum';

class TrackingHistoryEntryDto {
  @IsDateString()
  timestamp: string;

  @IsString()
  status: string;

  @IsString()
  location: string;

  @IsString()
  description: string;
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrackingHistoryEntryDto)
  tracking_history?: TrackingHistoryEntryDto[];
}
