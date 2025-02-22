import 'reflect-metadata';
/**
 * Tests for validating shipment DTOs:
 * - CreateShipmentDto
 * - UpdateShipmentStatusDto
 * Ensures proper validation of required fields and data formats
 */
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateShipmentDto } from '../dtos/create-shipment.dto';
import { UpdateShipmentStatusDto, TrackingHistoryEntry } from '../dtos/update-shipment-status.dto';
import { ShipmentStatus } from '../enums/shipment-status.enum';

describe('Shipment DTO Validation', () => {
  describe('CreateShipmentDto', () => {
    it('should validate a valid CreateShipmentDto', async () => {
      // Arrange: Create a valid DTO
      const dto = plainToInstance(CreateShipmentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        shipping_provider: 'FedEx',
        tracking_number: 'TRACK123',
        estimated_delivery_date: new Date('2025-03-01'),
        package_details: {
          weight: 2.5,
          weight_unit: 'kg',
          dimensions: {
            length: 30,
            width: 20,
            height: 10,
            unit: 'cm'
          }
        }
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify no validation errors
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid shipping provider', async () => {
      // Arrange: Create DTO with invalid shipping provider
      const dto = plainToInstance(CreateShipmentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        shipping_provider: 'InvalidProvider',
        tracking_number: 'TRACK123',
        estimated_delivery_date: new Date('2025-03-01'),
        package_details: {
          weight: 2.5,
          weight_unit: 'kg',
          dimensions: {
            length: 30,
            width: 20,
            height: 10,
            unit: 'cm'
          }
        }
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const shippingProviderError = errors.find(error => error.property === 'shipping_provider');
      expect(shippingProviderError).toBeDefined();
      expect(shippingProviderError?.constraints).toHaveProperty('isIn');
    });

    it('should fail validation with past estimated delivery date', async () => {
      // Arrange: Create DTO with past delivery date
      const dto = plainToInstance(CreateShipmentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        shipping_provider: 'FedEx',
        tracking_number: 'TRACK123',
        estimated_delivery_date: new Date('2020-01-01'), // Past date
        package_details: {
          weight: 2.5,
          weight_unit: 'kg',
          dimensions: {
            length: 30,
            width: 20,
            height: 10,
            unit: 'cm'
          }
        }
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find(error => error.property === 'estimated_delivery_date');
      expect(dateError).toBeDefined();
      expect(dateError?.constraints).toHaveProperty('minDate');
    });
  });

  describe('UpdateShipmentStatusDto', () => {
    it('should validate a valid status update', async () => {
      // Arrange: Create a valid status update DTO
      const dto = plainToInstance(UpdateShipmentStatusDto, {
        status: ShipmentStatus.SHIPPED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'shipped',
          location: 'Warehouse',
          description: 'Package has left the warehouse'
        }]
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify no validation errors
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid status', async () => {
      // Arrange: Create DTO with invalid status
      const dto = plainToInstance(UpdateShipmentStatusDto, {
        status: 'INVALID_STATUS' as ShipmentStatus,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'invalid',
          location: 'Unknown',
          description: 'Invalid status update'
        }]
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find(error => error.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid tracking history format', async () => {
      // Arrange: Create DTO with invalid tracking history
      const dto = plainToInstance(UpdateShipmentStatusDto, {
        status: ShipmentStatus.SHIPPED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'shipped',
          // Missing location and description
        }]
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const historyError = errors.find(error => error.property === 'tracking_history');
      expect(historyError).toBeDefined();
    });
  });
});
