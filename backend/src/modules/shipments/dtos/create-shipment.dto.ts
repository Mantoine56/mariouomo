/**
 * Data Transfer Object for creating a new shipment
 * Includes validation rules for all required fields
 */
import { IsNotEmpty, IsString, IsUUID, IsIn, IsDate, ValidateNested, IsNumber, Min, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Package dimensions with validation rules
 */
export class PackageDimensions {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;

  @IsIn(['cm', 'in'])
  unit: string;
}

/**
 * Package details with validation rules
 */
export class PackageDetails {
  @IsNumber()
  @Min(0)
  weight: number;

  @IsIn(['kg', 'lb'])
  weight_unit: string;

  @ValidateNested()
  @Type(() => PackageDimensions)
  dimensions: PackageDimensions;
}

/**
 * CreateShipmentDto with all required fields and validation rules
 */
export class CreateShipmentDto {
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['FedEx', 'UPS', 'USPS', 'DHL'])
  shipping_provider: string;

  @IsNotEmpty()
  @IsString()
  tracking_number: string;

  @IsDate()
  @Type(() => Date)
  @MinDate(new Date())
  estimated_delivery_date: Date;

  @ValidateNested()
  @Type(() => PackageDetails)
  package_details: PackageDetails;
}
