import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartRepository } from './repositories/shopping-cart.repository';
import { DatabaseModule } from '../../common/database/database.module';
import { AbandonedCartsScheduler } from './schedulers/abandoned-carts.scheduler';

/**
 * Module for managing shopping carts in the e-commerce platform
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    DatabaseModule,
  ],
  providers: [
    ShoppingCartRepository,
    AbandonedCartsScheduler,
  ],
  exports: [
    ShoppingCartRepository,
  ],
})
export class CartsModule {} 