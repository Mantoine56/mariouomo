import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';

/**
 * Development Module
 * 
 * This module contains endpoints and utilities for development and debugging
 * It should not be enabled in production environments
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [DevController],
  providers: [],
})
export class DevModule {} 