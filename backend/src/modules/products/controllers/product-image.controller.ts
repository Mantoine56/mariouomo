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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
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

    return {
      originalUrl,
      thumbnailUrl,
    };
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
}
