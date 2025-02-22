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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  MoveCategoryDto,
  CategoryTreeDto,
} from '../dtos/category.dto';
import { Category } from '../entities/category.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

/**
 * Controller for managing product categories
 * Includes endpoints for CRUD operations and tree structure management
 */
@ApiTags('Product Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, type: Category })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  /**
   * Update an existing category
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, type: Category })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  /**
   * Delete a category
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 204 })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }

  /**
   * Move a category to a new position
   */
  @Put(':id/move')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Move a category to a new position' })
  @ApiResponse({ status: 200, type: Category })
  async moveCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveCategoryDto: MoveCategoryDto,
  ): Promise<Category> {
    return this.categoryService.moveCategory(id, moveCategoryDto);
  }

  /**
   * Get category tree
   */
  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiResponse({ status: 200, type: [CategoryTreeDto] })
  async getCategoryTree(): Promise<Category[]> {
    return this.categoryService.getCategoryTree();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, type: Category })
  async getCategory(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  /**
   * Get category by slug
   */
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, type: Category })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoryService.getCategoryBySlug(slug);
  }

  /**
   * Update category product counts
   */
  @Post('update-counts')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update category product counts' })
  @ApiResponse({ status: 200 })
  async updateCategoryProductCounts(): Promise<void> {
    await this.categoryService.updateCategoryProductCounts();
  }
}
