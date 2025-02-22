import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order, OrderStatus } from '../entities/order.entity';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';
import { PaymentMethod } from '../../payments/enums/payment-method.enum';
import { ShipmentStatus } from '../../shipments/enums/shipment-status.enum';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrder: Order = {
    id: '123',
    user: {
      id: '456',
      email: 'test@example.com',
      role: 'customer',
      full_name: 'Test User',
      status: 'active',
      orders: [],
      addresses: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
    items: [],
    status: OrderStatus.PENDING,
    total_amount: 100,
    payments: [{
      id: '789',
      order_id: '123',
      amount: 100,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CREDIT_CARD,
      transaction_id: 'tx_123',
      order: null,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    shipments: [{
      id: '101',
      order_id: '123',
      status: ShipmentStatus.PENDING,
      tracking_number: 'track_123',
      shipping_method: 'standard',
      order: null,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockCreateOrderDto: CreateOrderDto = {
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
            createOrder: jest.fn().mockResolvedValue(mockOrder),
            updateOrder: jest.fn().mockResolvedValue({
              ...mockOrder,
              ...mockUpdateOrderDto,
            }),
            findOrderById: jest.fn().mockResolvedValue(mockOrder),
            findOrdersByUser: jest.fn().mockResolvedValue([mockOrder]),
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

      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(
        '456',
        mockCreateOrderDto,
      );
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const result = await controller.updateOrder('123', mockUpdateOrderDto);

      expect(result).toEqual({ ...mockOrder, ...mockUpdateOrderDto });
      expect(service.updateOrder).toHaveBeenCalledWith('123', mockUpdateOrderDto);
    });
  });

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const result = await controller.getOrder('123');

      expect(result).toEqual(mockOrder);
      expect(service.findOrderById).toHaveBeenCalledWith('123');
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for user', async () => {
      const req = { user: { id: '456' } };
      const result = await controller.getUserOrders(req);

      expect(result).toEqual([mockOrder]);
      expect(service.findOrdersByUser).toHaveBeenCalledWith('456');
    });
  });
});
