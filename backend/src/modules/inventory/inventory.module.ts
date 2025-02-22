import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

/**
 * Module for handling inventory management
 * Includes inventory tracking, stock management, and reordering functionality
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
