import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { AdjustInventoryDto } from '../dtos/adjust-inventory.dto';
import { InventoryItem } from '../entities/inventory-item.entity';

/**
 * Controller handling inventory-related endpoints
 * Implements proper authentication and role-based authorization
 */
@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Creates a new inventory item
   * Requires ADMIN role
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new inventory item (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Inventory item created successfully',
    type: InventoryItem,
  })
  async createInventoryItem(
    @Body() createDto: CreateInventoryDto,
  ): Promise<InventoryItem> {
    return this.inventoryService.createInventoryItem(createDto);
  }

  /**
   * Updates inventory item settings
   * Requires ADMIN role
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update inventory item settings (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory item updated successfully',
    type: InventoryItem,
  })
  async updateInventoryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateInventoryDto,
  ): Promise<InventoryItem> {
    return this.inventoryService.updateInventoryItem(id, updateDto);
  }

  /**
   * Adjusts inventory quantity
   * Requires ADMIN role
   */
  @Put(':id/adjust')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adjust inventory quantity (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory quantity adjusted successfully',
    type: InventoryItem,
  })
  async adjustInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustDto: AdjustInventoryDto,
  ): Promise<InventoryItem> {
    return this.inventoryService.adjustInventory(id, adjustDto);
  }

  /**
   * Gets inventory items with low stock
   * Requires ADMIN role
   */
  @Get('low-stock')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get low stock items (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock items retrieved successfully',
    type: [InventoryItem],
  })
  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryService.getLowStockItems();
  }

  /**
   * Gets inventory item by ID
   * Requires ADMIN role
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get inventory item by ID (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory item found',
    type: InventoryItem,
  })
  async getInventoryItem(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryItem> {
    return this.inventoryService.findInventoryById(id);
  }

  /**
   * Gets inventory items by variant
   * Requires ADMIN role
   */
  @Get('by-variant/:variantId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get inventory items by variant (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory items found',
    type: [InventoryItem],
  })
  async getInventoryByVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<InventoryItem[]> {
    return this.inventoryService.findInventoryByVariant(variantId);
  }

  /**
   * Gets inventory items by location
   * Requires ADMIN role
   */
  @Get('by-location/:location')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get inventory items by location (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory items found',
    type: [InventoryItem],
  })
  async getInventoryByLocation(
    @Param('location') location: string,
  ): Promise<InventoryItem[]> {
    return this.inventoryService.findInventoryByLocation(location);
  }
}
