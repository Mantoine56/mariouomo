import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsObject,
  IsArray,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for SEO metadata
 */
export class SeoMetadataDto {
  @ApiProperty({ description: 'SEO title' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  title?: string;

  @ApiProperty({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;

  @ApiProperty({ description: 'SEO keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

/**
 * Base DTO for category data
 */
export class BaseCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Category slug' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Category position in menu' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @ApiProperty({ description: 'Is category visible in menu?' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiProperty({ description: 'SEO metadata' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seoMetadata?: SeoMetadataDto;
}

/**
 * DTO for creating a new category
 */
export class CreateCategoryDto extends BaseCategoryDto {
  @ApiProperty({ description: 'Parent category ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

/**
 * DTO for updating an existing category
 */
export class UpdateCategoryDto extends BaseCategoryDto {
  @ApiProperty({ description: 'New parent category ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

/**
 * DTO for moving a category in the tree
 */
export class MoveCategoryDto {
  @ApiProperty({ description: 'New parent category ID' })
  @IsUUID()
  parentId: string;

  @ApiProperty({ description: 'New position in parent category' })
  @IsNumber()
  @Min(0)
  position: number;
}

/**
 * DTO for category tree response
 */
export class CategoryTreeDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category slug' })
  slug: string;

  @ApiProperty({ description: 'Category position' })
  position: number;

  @ApiProperty({ description: 'Number of products' })
  totalProducts: number;

  @ApiProperty({ description: 'Child categories' })
  @Type(() => CategoryTreeDto)
  children: CategoryTreeDto[];
}
