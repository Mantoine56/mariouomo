import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Discounts Module
 * 
 * Manages discount-related functionality including:
 * - Discount creation and management
 * - Coupon code generation and validation
 * - Promotional pricing rules
 * - Discount application logic
 * - Discount eligibility rules
 * - Discount reporting and analytics
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Discount entities will be registered here
    ]),
  ],
  controllers: [
    // Discount controllers will be registered here
  ],
  providers: [
    // Discount services will be registered here
  ],
  exports: [
    // Exported services
  ],
})
export class DiscountsModule {} 