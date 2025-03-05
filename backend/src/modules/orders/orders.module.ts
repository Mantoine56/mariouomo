import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Profile } from '../users/entities/profile.entity';

/**
 * Orders Module
 * 
 * Manages order-related functionality including:
 * - Order creation, retrieval, updating, and cancellation
 * - Order status management and transitions
 * - Order items and relationships with products
 * - Order fulfillment and shipping
 * - Order payment processing
 * - Transaction management with inventory locking
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
