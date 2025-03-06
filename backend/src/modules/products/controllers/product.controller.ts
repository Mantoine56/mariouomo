import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { SearchProductsDto } from '../dtos/search-products.dto';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { Product } from '../entities/product.entity';

/**
 * Controller handling product-related endpoints
 * Implements proper authentication and authorization
 */
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product
   * @param createProductDto Product creation data
   * @returns Created product with variants
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: Product,
  })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  /**
   * Get a product by ID
   * @param id Product UUID
   * @returns Product with variants and images
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async getProduct(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.getProduct(id);
  }

  /**
   * Search products with filtering and pagination
   * @param searchDto Search criteria
   * @param paginationDto Pagination options
   * @returns Paginated list of products matching criteria
   */
  @Get()
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products found',
    type: [Product],
  })
  async searchProducts(
    @Query() searchDto: SearchProductsDto,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.productService.searchProducts(searchDto, paginationDto);
  }

  /**
   * Update a product
   * @param id Product UUID to update
   * @param updateProductDto Product update data
   * @returns Updated product
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  /**
   * Delete a product (soft delete)
   * @param id Product UUID to delete
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deleted successfully',
  })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  /**
   * Add an image to a product
   * @param id Product UUID
   * @param imageData Image URLs
   */
  @Post(':id/images')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add an image to a product (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image added successfully',
  })
  async addProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() imageData: { originalUrl: string; thumbnailUrl: string },
  ): Promise<void> {
    return this.productService.addProductImage(id, imageData);
  }

  /**
   * Remove an image from a product
   * @param productId Product UUID
   * @param imageId Image UUID to remove
   */
  @Delete(':productId/images/:imageId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an image from a product (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Image removed successfully',
  })
  async removeProductImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productService.removeProductImage(productId, imageId);
  }
}
