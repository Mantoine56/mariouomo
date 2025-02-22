import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Pipe for validating file uploads
 * Checks file size, type, and other security constraints
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private readonly configService: ConfigService) {
    // 5MB default max size
    this.maxSize = this.configService.get('MAX_FILE_SIZE') || 5 * 1024 * 1024;
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum size of ${this.maxSize / 1024 / 1024}MB`,
      );
    }

    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
