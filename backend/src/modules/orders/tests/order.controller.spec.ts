import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order, OrderStatus } from '../entities/order.entity';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrder: Order = {
    id: '123',
    user_id: 'user123',
    status: OrderStatus.PENDING,
    subtotal: 100,
    tax: 10,
    shipping: 5,
    total_amount: 115,
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
    items: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateOrderDto: CreateOrderDto = {
    items: [
      {
        variant_id: 'variant123',
        quantity: 2,
      },
    ],
    shipping_address: mockOrder.shipping_address,
    billing_address: mockOrder.billing_address,
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
      const req = { user: { id: 'user123' } };
      const result = await controller.createOrder(req, mockCreateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(
        'user123',
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
      const req = { user: { id: 'user123' } };
      const result = await controller.getUserOrders(req);

      expect(result).toEqual([mockOrder]);
      expect(service.findOrdersByUser).toHaveBeenCalledWith('user123');
    });
  });
});
