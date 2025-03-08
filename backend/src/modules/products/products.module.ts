import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { VariantController } from './controllers/variant.controller';
import { ProductImageController } from './controllers/product-image.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductImageRepository } from './repositories/product-image.repository';
import { CategoryService } from './services/category.service';
import { VariantService } from './services/variant.service';
import { ImageService } from './services/image.service';
import { RedisCacheModule } from '../../common/cache/cache.module';

/**
 * Products Module
 * 
 * Manages product-related functionality including:
 * - Product creation, retrieval, updating, and deletion
 * - Product variants and options
 * - Product categories and collections
 * - Product search and filtering
 * - Product image management
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      Category,
      ProductRepository,
      ProductImageRepository,
    ]),
    RedisCacheModule,
  ],
  controllers: [
    ProductController,
    CategoryController,
    VariantController,
    ProductImageController,
  ],
  providers: [
    ProductService,
    CategoryService,
    VariantService,
    ImageService,
    ProductRepository,
    ProductImageRepository,
  ],
  exports: [
    ProductService,
    CategoryService,
    VariantService,
    ImageService,
  ],
})
export class ProductsModule {} 