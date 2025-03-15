import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../../../common/supabase/supabase.service';

/**
 * Service responsible for handling product image operations
 * Uses Supabase Storage for image uploads
 */
@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly bucketName: string = 'product-images';

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService
  ) {}

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

      // Upload both versions to Supabase Storage
      const [originalResult, thumbnailResult] = await Promise.all([
        this.uploadToSupabaseStorage(processedImage, `${filename}.jpg`),
        this.uploadToSupabaseStorage(thumbnail, `${filename}-thumb.jpg`),
      ]);

      // Get public URLs for the uploaded files
      const supabase = this.supabaseService.getClient();
      const originalUrl = supabase.storage.from(this.bucketName).getPublicUrl(`${filename}.jpg`).data.publicUrl;
      const thumbnailUrl = supabase.storage.from(this.bucketName).getPublicUrl(`${filename}-thumb.jpg`).data.publicUrl;

      return {
        originalUrl,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading product image: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process image: ${error.message}`);
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
   * Upload file to Supabase Storage
   * @param buffer File buffer
   * @param path File path in the bucket
   * @returns Upload result
   */
  private async uploadToSupabaseStorage(buffer: Buffer, path: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      
      this.logger.debug(`Uploading to Supabase Storage bucket: ${this.bucketName}, path: ${path}`);
      this.logger.debug(`Buffer size: ${buffer.length} bytes`);
      
      // Verify the bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();
      
      if (bucketError) {
        this.logger.error(`Error listing buckets: ${bucketError.message}`);
        throw new Error(`Failed to list buckets: ${bucketError.message}`);
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      if (!bucketExists) {
        this.logger.error(`Bucket '${this.bucketName}' does not exist in Supabase storage`);
        throw new Error(`Bucket '${this.bucketName}' does not exist in Supabase storage`);
      }
      
      this.logger.debug(`Bucket '${this.bucketName}' found, proceeding with upload`);
      
      // Attempt the upload
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, buffer, {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
          upsert: true
        });

      if (error) {
        this.logger.error(`Error uploading to Supabase Storage: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error)}`);
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }

      this.logger.debug(`Successfully uploaded file to Supabase Storage: ${path}`);
      this.logger.debug(`Upload response: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Error uploading to Supabase Storage: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new BadRequestException(`Failed to upload image to Supabase Storage: ${error.message}`);
    }
  }

  /**
   * Delete image and its thumbnail from Supabase Storage
   * @param imageUrl URL of the image to delete
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const path = this.getPathFromUrl(imageUrl);
      const thumbPath = path.replace('.jpg', '-thumb.jpg');
      
      const supabase = this.supabaseService.getClient();
      
      this.logger.debug(`Deleting images from Supabase Storage: ${path} and ${thumbPath}`);

      const [originalResult, thumbnailResult] = await Promise.all([
        supabase.storage.from(this.bucketName).remove([path]),
        supabase.storage.from(this.bucketName).remove([thumbPath])
      ]);

      if (originalResult.error) {
        this.logger.error(`Error deleting original image: ${originalResult.error.message}`);
      }
      
      if (thumbnailResult.error) {
        this.logger.error(`Error deleting thumbnail: ${thumbnailResult.error.message}`);
      }
      
      this.logger.debug(`Successfully deleted images from Supabase Storage`);
    } catch (error) {
      this.logger.error(`Error deleting image: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Extract path from URL
   * @param url Image URL
   * @returns Storage path
   */
  private getPathFromUrl(url: string): string {
    // Parse the URL and extract the path (removing the bucket name and any prefix)
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the bucket name in the path and return everything after it
    const bucketIndex = pathParts.findIndex(part => part === this.bucketName);
    if (bucketIndex !== -1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    
    // Fallback: return the path without the first segment (assuming it's the bucket)
    return pathParts.slice(2).join('/');
  }
}
