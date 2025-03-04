/**
 * Seed Module
 * 
 * This module registers the seed service and its dependencies.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsSeedService } from './analytics-seed';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { Store } from '../modules/stores/entities/store.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Category,
      Profile,
      Store,
      ProductVariant,
      ProductImage,
    ]),
  ],
  providers: [AnalyticsSeedService],
  exports: [AnalyticsSeedService],
})
export class SeedModule {} 