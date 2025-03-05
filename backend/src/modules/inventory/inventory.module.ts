import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

/**
 * Inventory Module
 * 
 * Manages inventory-related functionality including:
 * - Inventory tracking and management
 * - Stock level monitoring
 * - Inventory adjustments and reconciliation
 * - Low stock alerts
 * - Distributed locking for concurrent operations
 * - Inventory reporting
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem, ProductVariant]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
