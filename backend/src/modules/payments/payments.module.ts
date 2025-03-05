import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
})
export class PaymentsModule {} 