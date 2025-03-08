import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';

/**
 * Payments Module
 * 
 * Manages payment-related functionality including:
 * - Payment processing and gateway integration
 * - Payment method management
 * - Transaction history and records
 * - Refund processing
 * - Payment security and compliance
 * - Subscription billing
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Payment entities will be registered here
      Payment
    ]),
  ],
  controllers: [
    // Payment controllers will be registered here
  ],
  providers: [
    // Payment services will be registered here
  ],
  exports: [
    // Exported services
    TypeOrmModule
  ],
})
export class PaymentsModule {} 