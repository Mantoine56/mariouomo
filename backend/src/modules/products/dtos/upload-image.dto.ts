import { IsString, IsUUID } from 'class-validator';

/**
 * DTO for image upload request
 */
export class UploadImageDto {
  @IsUUID()
  productId: string;

  @IsString()
  contentType: string;
}
