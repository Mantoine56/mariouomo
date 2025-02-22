import { IsUUID, IsString, IsOptional, IsDate, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class DimensionsDto {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;

  @IsString()
  unit: string;
}

class PackageDetailsDto {
  @IsNumber()
  @Min(0)
  weight: number;

  @IsString()
  weight_unit: string;

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;
}

export class CreateShipmentDto {
  @IsUUID()
  order_id: string;

  @IsString()
  shipping_provider: string;

  @IsString()
  tracking_number: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  estimated_delivery_date?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => PackageDetailsDto)
  package_details?: PackageDetailsDto;

  @IsOptional()
  @IsString({ each: true })
  metadata?: Record<string, any>;
}
