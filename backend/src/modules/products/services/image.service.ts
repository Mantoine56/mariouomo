import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service responsible for handling product image operations
 * Includes upload, optimization, and CDN integration
 */
@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly s3: S3;
  private readonly bucketName: string;
  private readonly cdnDomain: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET') || 'default-bucket';
    this.cdnDomain = this.configService.get('CDN_DOMAIN') || 'cdn.example.com';
  }

  /**
   * Upload and process a product image
   * @param file Image file buffer
   * @param productId Associated product ID
   * @returns Object containing URLs for original and thumbnail images
   */
  async uploadProductImage(file: Buffer, productId: string) {
    try {
      // Generate unique filename
      const filename = `${productId}/${uuidv4()}`;

      // Process original image
      const processedImage = await this.processImage(file, {
        width: 1200,
        height: 1200,
        fit: 'inside',
      });

      // Create thumbnail
      const thumbnail = await this.processImage(file, {
        width: 300,
        height: 300,
        fit: 'cover',
      });

      // Upload both versions to S3
      const [originalUrl, thumbnailUrl] = await Promise.all([
        this.uploadToS3(processedImage, `${filename}.jpg`),
        this.uploadToS3(thumbnail, `${filename}-thumb.jpg`),
      ]);

      return {
        originalUrl: this.getCdnUrl(originalUrl),
        thumbnailUrl: this.getCdnUrl(thumbnailUrl),
      };
    } catch (error) {
      this.logger.error(`Error uploading product image: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to process image');
    }
  }

  /**
   * Process image with sharp for optimization and resizing
   * @param buffer Image buffer
   * @param options Processing options
   * @returns Processed image buffer
   */
  private async processImage(buffer: Buffer, options: sharp.ResizeOptions): Promise<Buffer> {
    return sharp(buffer)
      .resize(options)
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  }

  /**
   * Upload file to S3
   * @param buffer File buffer
   * @param key S3 key
   * @returns S3 URL
   */
  private async uploadToS3(buffer: Buffer, key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Convert S3 URL to CDN URL
   * @param s3Url Original S3 URL
   * @returns CDN URL
   */
  private getCdnUrl(s3Url: string): string {
    if (!this.cdnDomain) return s3Url;
    return s3Url.replace(
      `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com`,
      this.cdnDomain
    );
  }

  /**
   * Delete image and its thumbnail from S3
   * @param imageUrl URL of the image to delete
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(imageUrl);
      const thumbKey = key.replace('.jpg', '-thumb.jpg');

      await Promise.all([
        this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise(),
        this.s3.deleteObject({ Bucket: this.bucketName, Key: thumbKey }).promise(),
      ]);
    } catch (error) {
      this.logger.error(`Error deleting image: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete image');
    }
  }

  /**
   * Extract S3 key from URL
   * @param url Image URL
   * @returns S3 key
   */
  private getKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  }
}
