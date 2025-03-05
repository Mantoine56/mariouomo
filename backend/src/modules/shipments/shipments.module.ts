import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Shipments Module
 * 
 * Manages shipment-related functionality including:
 * - Shipment creation and tracking
 * - Shipping method management
 * - Shipping rate calculation
 * - Shipping label generation
 * - Carrier integration
 * - Delivery status updates
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Shipment entities will be registered here
    ]),
  ],
  controllers: [
    // Shipment controllers will be registered here
  ],
  providers: [
    // Shipment services will be registered here
  ],
  exports: [
    // Exported services
  ],
})
export class ShipmentsModule {} 