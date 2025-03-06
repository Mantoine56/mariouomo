/**
 * Unit tests for Shipment Events
 * Tests event emissions for all shipment lifecycle events:
 * - Creation
 * - Status updates
 * - Delivery
 * - Failure
 * - Cancellation
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentService } from '../services/shipment.service';
import { Shipment } from '../entities/shipment.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ShipmentStatus } from '../enums/shipment-status.enum';
import { Repository } from 'typeorm';

describe('ShipmentEvents', () => {
  let service: ShipmentService;
  let shipmentRepository: Repository<Shipment>;
  let eventEmitter: EventEmitter2;

  // Mock data representing a valid order
  const mockOrder = {
    id: '456',
    store_id: 'store123', // Added required store_id property
    user_id: '789',
    user: {
      id: '789',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      role: 'customer',
      status: 'active',
      orders: [],
      addresses: [],
      created_at: new Date(),
      updated_at: new Date()
    },
    status: OrderStatus.CONFIRMED,
    total_amount: 100,
    subtotal_amount: 90, // Changed from subtotal to subtotal_amount
    tax_amount: 5, // Changed from tax to tax_amount
    shipping_amount: 5, // Changed from shipping to shipping_amount
    discount_amount: 0, // Added required discount_amount property
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001'
    },
    billing_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001'
    },
    items: [],
    shipments: [],
    payments: [],
    created_at: new Date(),
    updated_at: new Date()
  };

  // Mock data representing a valid shipment
  const mockShipment: Shipment = {
    id: '123',
    order_id: '456',
    shipping_provider: 'FedEx',
    tracking_number: 'TRACK123',
    status: ShipmentStatus.PROCESSING,
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
    },
    tracking_history: [],
    delivered_at: undefined,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    order: mockOrder
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: {
            create: jest.fn().mockReturnValue(mockShipment),
            save: jest.fn().mockImplementation((shipment: Partial<Shipment>) => Promise.resolve({
              ...mockShipment,
              ...shipment
            } as Shipment)),
            findOne: jest.fn().mockResolvedValue(mockShipment),
            update: jest.fn().mockResolvedValue({ affected: 1 })
          }
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockOrder)
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<ShipmentService>(ShipmentService);
    shipmentRepository = module.get(getRepositoryToken(Shipment));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Shipment Creation Events', () => {
    it('should emit shipment.created event on creation', async () => {
      // Arrange: Prepare shipment creation data
      const createShipmentDto = {
        order_id: '456',
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
      };

      // Act: Create shipment
      await service.createShipment(createShipmentDto);

      // Assert: Verify event emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.created',
        expect.objectContaining({
          id: mockShipment.id,
          order_id: mockShipment.order_id
        })
      );
    });
  });

  describe('Status Update Events', () => {
    it('should emit shipment.shipped event when status changes to SHIPPED', async () => {
      // Arrange: Mock current shipment status
      const processingShipment = { ...mockShipment, status: ShipmentStatus.PROCESSING };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(processingShipment);
      jest.spyOn(shipmentRepository, 'save').mockImplementationOnce((shipment: Partial<Shipment>) => 
        Promise.resolve({
          ...processingShipment,
          ...shipment,
          status: ShipmentStatus.SHIPPED
        } as Shipment)
      );

      // Act: Update shipment status
      await service.updateShipmentStatus(mockShipment.id, {
        status: ShipmentStatus.SHIPPED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'shipped',
          location: 'Warehouse',
          description: 'Package has left the warehouse'
        }]
      });

      // Assert: Verify event emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.shipped',
        expect.objectContaining({
          id: mockShipment.id,
          status: ShipmentStatus.SHIPPED
        })
      );
    });

    it('should emit shipment.in_transit event when status changes to IN_TRANSIT', async () => {
      // Arrange: Mock current shipment status
      const shippedShipment = { ...mockShipment, status: ShipmentStatus.SHIPPED };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(shippedShipment);
      jest.spyOn(shipmentRepository, 'save').mockImplementationOnce((shipment: Partial<Shipment>) => 
        Promise.resolve({
          ...shippedShipment,
          ...shipment,
          status: ShipmentStatus.IN_TRANSIT
        } as Shipment)
      );

      // Act: Update shipment status
      await service.updateShipmentStatus(mockShipment.id, {
        status: ShipmentStatus.IN_TRANSIT,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'in_transit',
          location: 'Local Delivery Center',
          description: 'Package is in transit'
        }]
      });

      // Assert: Verify event emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.in_transit',
        expect.objectContaining({
          id: mockShipment.id,
          status: ShipmentStatus.IN_TRANSIT
        })
      );
    });
  });

  describe('Failure Events', () => {
    it('should emit shipment.failed event when status changes to FAILED', async () => {
      // Arrange: Prepare failure status update and mock current status
      const processingShipment = { ...mockShipment, status: ShipmentStatus.PROCESSING };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(processingShipment);

      const updateDto = {
        status: ShipmentStatus.FAILED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'failed',
          location: 'Distribution Center',
          description: 'Package damaged during transit'
        }]
      };

      // Act: Update shipment status to failed
      const result = await service.updateShipmentStatus(mockShipment.id, updateDto);

      // Assert: Verify event emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.failed',
        expect.objectContaining({
          id: mockShipment.id,
          status: ShipmentStatus.FAILED
        })
      );
    });
  });

  describe('Cancellation Events', () => {
    it('should emit shipment.cancelled event when status changes to CANCELLED', async () => {
      // Arrange: Prepare cancellation status update and mock current status
      const processingShipment = { ...mockShipment, status: ShipmentStatus.PROCESSING };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(processingShipment);

      const updateDto = {
        status: ShipmentStatus.CANCELLED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'cancelled',
          location: 'Processing Center',
          description: 'Shipment cancelled by customer'
        }]
      };

      // Act: Update shipment status to cancelled
      const result = await service.updateShipmentStatus(mockShipment.id, updateDto);

      // Assert: Verify event emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.cancelled',
        expect.objectContaining({
          id: mockShipment.id,
          status: ShipmentStatus.CANCELLED
        })
      );
    });
  });
});
