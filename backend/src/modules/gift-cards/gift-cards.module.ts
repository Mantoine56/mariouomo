import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Gift Cards Module
 * 
 * Manages gift card-related functionality including:
 * - Gift card creation and management
 * - Gift card code generation
 * - Gift card redemption and validation
 * - Gift card balance tracking
 * - Gift card expiration handling
 * - Gift card reporting
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Gift card entities will be registered here
    ]),
  ],
  controllers: [
    // Gift card controllers will be registered here
  ],
  providers: [
    // Gift card services will be registered here
  ],
  exports: [
    // Exported services
  ],
})
export class GiftCardsModule {} 