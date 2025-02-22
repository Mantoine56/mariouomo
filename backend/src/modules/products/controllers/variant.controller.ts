import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VariantService } from '../services/variant.service';
import { CreateVariantDto, UpdateVariantDto } from '../dtos/variant.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

/**
 * Controller for managing product variants
 * Includes endpoints for CRUD operations and inventory management
 */
@ApiTags('Product Variants')
@Controller('variants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  /**
   * Create a new product variant
   */
  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({ status: 201, type: ProductVariant })
  async createVariant(@Body() createVariantDto: CreateVariantDto): Promise<ProductVariant> {
    return this.variantService.createVariant(createVariantDto);
  }

  /**
   * Update an existing variant
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiOperation({ summary: 'Update an existing variant' })
  @ApiResponse({ status: 200, type: ProductVariant })
  async updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ): Promise<ProductVariant> {
    return this.variantService.updateVariant(id, updateVariantDto);
  }

  /**
   * Delete a variant
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiResponse({ status: 204 })
  async deleteVariant(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.variantService.deleteVariant(id);
  }

  /**
   * Update variant inventory
   */
  @Put(':id/inventory')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiOperation({ summary: 'Update variant inventory' })
  @ApiResponse({ status: 200, type: ProductVariant })
  async updateInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductVariant> {
    return this.variantService.updateInventory(id, quantity);
  }

  /**
   * Get variant by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: 200, type: ProductVariant })
  async getVariant(@Param('id', ParseUUIDPipe) id: string): Promise<ProductVariant> {
    return this.variantService.getVariantById(id);
  }

  /**
   * Get all variants for a product
   */
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all variants for a product' })
  @ApiResponse({ status: 200, type: [ProductVariant] })
  async getProductVariants(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariant[]> {
    return this.variantService.getProductVariants(productId);
  }
}
