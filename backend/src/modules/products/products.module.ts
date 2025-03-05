import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      // Product entities will be registered here
    ]),
  ],
  controllers: [
    // Product controllers will be registered here
  ],
  providers: [
    // Product services and repositories will be registered here
  ],
  exports: [
    // Exported services and repositories
  ],
})
export class ProductsModule {} 