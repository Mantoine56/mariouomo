import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  Body,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageService } from '../services/image.service';
import { ProductService } from '../services/product.service';
import { FileValidationPipe } from '../../../common/pipes/file-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { ProductImage } from '../entities/product-image.entity';

/**
 * Controller for handling product image operations
 * Includes endpoints for uploading and deleting product images
 */
@ApiTags('Product Images')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Upload a new product image
   * @param productId Product ID
   * @param file Image file
   * @returns URLs for original and thumbnail images
   */
  @Post(':productId/images')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  async uploadImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    try {
      // Check if product exists
      const product = await this.productService.getProductById(productId);
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      // Upload and process image
      const { originalUrl, thumbnailUrl } = await this.imageService.uploadProductImage(
        file.buffer,
        productId,
      );

      // Update product with new image URLs
      await this.productService.addProductImage(productId, {
        originalUrl,
        thumbnailUrl,
      });

      // Return with status code for explicit response
      // Include both camelCase and snake_case versions for compatibility
      return {
        success: true,
        originalUrl,
        thumbnailUrl,
        original_url: originalUrl, // Snake case alias for frontend compatibility
        thumbnail_url: thumbnailUrl, // Snake case alias for frontend compatibility
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      // Log detailed error information
      console.error(`Error uploading image for product ${productId}:`, error);
      
      // Re-throw specific error types without modification
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Otherwise, wrap in a more user-friendly error message
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete a product image
   * @param productId Product ID
   * @param imageId Image ID
   */
  @Delete(':productId/images/:imageId')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  async deleteImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    // Check if product and image exist
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const image = product.images.find((img: ProductImage) => img.id === imageId);
    if (!image) {
      throw new BadRequestException('Image not found');
    }

    // Delete image from storage
    await this.imageService.deleteImage(image.originalUrl);

    // Remove image from product
    await this.productService.removeProductImage(productId, imageId);

    return {
      message: 'Image deleted successfully',
    };
  }

  /**
   * Delete multiple product images in a batch operation
   * @param productId Product ID
   * @param data Object containing array of image IDs to delete
   */
  @Post(':productId/images/batch-delete')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete multiple product images (Admin/Merchant only)' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Images deleted successfully',
  })
  async batchDeleteImages(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() data: { imageIds: string[] },
  ) {
    try {
      // Check if product exists
      const product = await this.productService.getProductById(productId);
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      // Validate that all image IDs belong to the product
      const validImageIds = product.images
        .map((img: ProductImage) => img.id)
        .filter(id => data.imageIds.includes(id));

      if (validImageIds.length !== data.imageIds.length) {
        throw new BadRequestException('One or more image IDs are invalid or do not belong to this product');
      }

      // Delete each image from storage and database
      const results = await Promise.all(
        validImageIds.map(async (imageId) => {
          try {
            // Find the image in the product's images array
            const image = product.images.find((img: ProductImage) => img.id === imageId);
            
            if (image && image.originalUrl) {
              // Delete image from storage
              await this.imageService.deleteImage(image.originalUrl);
            }
            
            // Remove image from database
            await this.productService.removeProductImage(productId, imageId);
            
            return { id: imageId, success: true };
          } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            return { id: imageId, success: false, error: error.message };
          }
        })
      );

      // The ProductService.removeProductImage method should handle cache invalidation internally

      return {
        message: 'Batch image deletion completed',
        results,
        success: results.every(r => r.success),
      };
    } catch (error) {
      console.error(`Error in batch delete operation for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Update image alt text
   * @param productId Product ID
   * @param imageId Image ID
   * @param data Object containing alt text
   */
  @Put(':productId/images/:imageId')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update image alt text (Admin/Merchant only)' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        altText: {
          type: 'string',
          description: 'New alt text for the image',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alt text updated successfully',
  })
  async updateImageAltText(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() data: { altText: string },
  ) {
    try {
      // Check if product exists
      const product = await this.productService.getProductById(productId);
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      // Check if image exists and belongs to the product
      const image = product.images.find((img: ProductImage) => img.id === imageId);
      if (!image) {
        throw new BadRequestException('Image not found');
      }

      // Update the alt text using the service method
      await this.productService.updateProductImageAltText(imageId, data.altText);

      return {
        success: true,
        message: 'Alt text updated successfully',
      };
    } catch (error) {
      console.error(`Error updating alt text for image ${imageId}:`, error);
      throw error;
    }
  }
}
