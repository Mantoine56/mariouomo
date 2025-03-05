import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Stores Module
 * 
 * Manages store-related functionality including:
 * - Store creation and management
 * - Store settings and configuration
 * - Store branding and customization
 * - Store locations and hours
 * - Multi-store support
 * - Store-specific inventory and products
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Store entities will be registered here
    ]),
  ],
  controllers: [
    // Store controllers will be registered here
  ],
  providers: [
    // Store services will be registered here
  ],
  exports: [
    // Exported services
  ],
})
export class StoresModule {} 