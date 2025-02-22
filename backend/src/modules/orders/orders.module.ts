import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Profile } from '../users/entities/profile.entity';

/**
 * Module for handling order-related functionality
 * Includes order creation, management, and status updates
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, ProductVariant, Profile]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
