/**
 * Unit tests for the ShipmentService
 * Tests all core functionality including:
 * - Shipment creation
 * - Status updates
 * - Delivery management
 * - Error handling
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentService } from '../services/shipment.service';
import { Shipment } from '../entities/shipment.entity';
import { ShipmentStatus } from '../enums/shipment-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Describe block for ShipmentService tests
 */
describe('ShipmentService', () => {
  let service: ShipmentService;
  let shipmentRepository: Repository<Shipment>;
  let orderRepository: Repository<Order>;
  let eventEmitter: EventEmitter2;

  /**
   * Mock data representing a valid order
   */
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

  /**
   * Mock data representing a valid shipment
   */
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

  /**
   * Set up test module with mock repositories and event emitter
   */
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
            find: jest.fn().mockResolvedValue([mockShipment]),
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
    orderRepository = module.get(getRepositoryToken(Order));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  /**
   * Describe block for createShipment tests
   */
  describe('createShipment', () => {
    it('should create a new shipment', async () => {
      // Arrange: Prepare test data
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

      // Act: Call the service method
      const result = await service.createShipment(createShipmentDto);

      // Assert: Verify the results
      expect(result).toEqual(mockShipment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.created',
        expect.objectContaining({ id: mockShipment.id })
      );
    });

    it('should throw BadRequestException if order not found', async () => {
      // Arrange: Mock order not found
      jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(null);

      // Act & Assert: Verify error handling
      await expect(service.createShipment({
        order_id: 'non-existent',
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
      })).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Describe block for updateShipmentStatus tests
   */
  describe('updateShipmentStatus', () => {
    it('should update shipment status', async () => {
      // Arrange: Mock current shipment with PROCESSING status
      const processingShipment = { ...mockShipment, status: ShipmentStatus.PROCESSING };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(processingShipment);
      jest.spyOn(shipmentRepository, 'save').mockImplementationOnce((shipment: Partial<Shipment>) => 
        Promise.resolve({
          ...processingShipment,
          ...shipment,
          status: ShipmentStatus.SHIPPED
        } as Shipment)
      );

      // Act: Update status to SHIPPED
      const result = await service.updateShipmentStatus(mockShipment.id, {
        status: ShipmentStatus.SHIPPED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'shipped',
          location: 'Warehouse',
          description: 'Package has left the warehouse'
        }]
      });

      // Assert: Verify status update
      expect(result.status).toBe(ShipmentStatus.SHIPPED);
      expect(shipmentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if shipment not found', async () => {
      // Arrange: Mock shipment not found
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(null);
      
      // Act & Assert: Verify error handling
      await expect(service.updateShipmentStatus('non-existent', {
        status: ShipmentStatus.SHIPPED
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      // Arrange: Mock current shipment with PENDING status
      const pendingShipment = { ...mockShipment, status: ShipmentStatus.PENDING };
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(pendingShipment);

      // Act & Assert: Verify error for invalid transition
      await expect(service.updateShipmentStatus(mockShipment.id, {
        status: ShipmentStatus.DELIVERED,
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'delivered',
          location: 'Destination',
          description: 'Package has been delivered'
        }]
      })).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Describe block for getShipment tests
   */
  describe('getShipment', () => {
    it('should return shipment by id', async () => {
      // Act: Call the service method
      const result = await service.getShipment(mockShipment.id);

      // Assert: Verify the result
      expect(result).toEqual(mockShipment);
    });

    it('should throw NotFoundException if shipment not found', async () => {
      // Arrange: Mock shipment not found
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(null);

      // Act & Assert: Verify error handling
      await expect(service.getShipment('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Describe block for getOrderShipments tests
   */
  describe('getOrderShipments', () => {
    it('should return all shipments for an order', async () => {
      // Act: Call the service method
      const result = await service.getOrderShipments(mockOrder.id);

      // Assert: Verify the result
      expect(result).toEqual([mockShipment]);
    });
  });

  /**
   * Describe block for markAsDelivered tests
   */
  describe('markAsDelivered', () => {
    it('should mark shipment as delivered', async () => {
      // Arrange: Prepare delivery details
      const deliveryDetails = {
        delivered_at: new Date(),
        tracking_history: [{
          timestamp: new Date().toISOString(),
          status: 'delivered',
          location: 'Destination',
          description: 'Package has been delivered'
        }]
      };

      // Act: Call the service method
      const result = await service.markAsDelivered(mockShipment.id, deliveryDetails);

      // Assert: Verify the results
      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.delivered',
        expect.objectContaining({ 
          id: mockShipment.id,
          status: ShipmentStatus.DELIVERED,
          delivered_at: deliveryDetails.delivered_at
        })
      );
    });

    it('should throw NotFoundException if shipment not found', async () => {
      // Arrange: Mock shipment not found
      jest.spyOn(shipmentRepository, 'findOne').mockResolvedValueOnce(null);
      
      // Act & Assert: Verify error handling
      await expect(service.markAsDelivered('non-existent', {
        delivered_at: new Date()
      })).rejects.toThrow(NotFoundException);
    });
  });
});
