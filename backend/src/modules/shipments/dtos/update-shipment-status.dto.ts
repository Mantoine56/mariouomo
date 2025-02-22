/**
 * Data Transfer Object for updating shipment status
 * Includes validation rules for status and tracking history
 */
import { IsNotEmpty, IsEnum, IsArray, ValidateNested, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '../enums/shipment-status.enum';

/**
 * Tracking history entry with validation rules
 */
export class TrackingHistoryEntry {
  @IsNotEmpty()
  @IsDateString()
  timestamp: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

/**
 * UpdateShipmentStatusDto with validation rules for status updates
 */
export class UpdateShipmentStatusDto {
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackingHistoryEntry)
  tracking_history: TrackingHistoryEntry[];
}
