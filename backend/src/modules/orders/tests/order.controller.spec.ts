import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order, OrderStatus } from '../entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentMethod } from '../../payments/enums/payment-method.enum';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../../shipments/enums/shipment-status.enum';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrder: Partial<Order> = {
    id: '123',
    user_id: '456',
    items: [],
    status: OrderStatus.PENDING,
    total_amount: 100,
    payments: [
      {
        id: '789',
        amount: 100,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CREDIT_CARD,
        transaction_id: 'tx_123',
        order: {} as Order,
        created_at: new Date(),
        updated_at: new Date(),
      } as Payment,
    ],
    shipments: [
      {
        id: '101',
        order_id: '123',
        status: ShipmentStatus.PENDING,
        tracking_number: 'track_123',
        carrier: 'UPS',
        shipping_provider: 'UPS',
        order: {} as Order,
        created_at: new Date(),
        updated_at: new Date(),
      } as Shipment,
    ],
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockCreateOrderDto: CreateOrderDto = {
    // Add the required store_id property
    store_id: 'store123',
    items: [
      {
        variant_id: 'variant123',
        quantity: 2,
      },
    ],
    shipping_address: {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      country: 'Country',
      postal_code: '12345',
    },
    billing_address: {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      country: 'Country',
      postal_code: '12345',
    },
  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    status: OrderStatus.CONFIRMED,
    staff_notes: 'Test note',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn().mockResolvedValue(mockOrder as Order),
            updateOrder: jest.fn().mockResolvedValue({
              ...mockOrder,
              ...mockUpdateOrderDto,
            } as Order),
            findOrderById: jest.fn().mockResolvedValue(mockOrder as Order),
            findOrdersByUser: jest.fn().mockResolvedValue([mockOrder as Order]),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const req = { user: { id: '456' } };
      const result = await controller.createOrder(req, mockCreateOrderDto);

      expect(result).toEqual(mockOrder as Order);
      expect(service.createOrder).toHaveBeenCalledWith(
        '456',
        mockCreateOrderDto,
      );
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const result = await controller.updateOrder('123', mockUpdateOrderDto);

      expect(result).toEqual({ ...mockOrder, ...mockUpdateOrderDto } as Order);
      expect(service.updateOrder).toHaveBeenCalledWith('123', mockUpdateOrderDto);
    });
  });

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const result = await controller.getOrder('123');

      expect(result).toEqual(mockOrder as Order);
      expect(service.findOrderById).toHaveBeenCalledWith('123');
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for user', async () => {
      const req = { user: { id: '456' } };
      const result = await controller.getUserOrders(req);

      expect(result).toEqual([mockOrder as Order]);
      expect(service.findOrdersByUser).toHaveBeenCalledWith('456');
    });
  });
});
