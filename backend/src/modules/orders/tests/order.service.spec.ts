import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Profile } from '../../users/entities/profile.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let variantRepository: Repository<ProductVariant>;
  let profileRepository: Repository<Profile>;
  let dataSource: DataSource;

  const mockOrder = {
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
  };

  const mockVariant = {
    id: 'variant123',
    name: 'Test Variant',
    price: 50,
    stock_quantity: 10,
    product_name: 'Test Product',
    sku: 'TEST-123',
  };

  const mockProfile = {
    id: 'user123',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    variantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto = {
      items: [
        {
          variant_id: 'variant123',
          quantity: 2,
        },
      ],
      shipping_address: mockOrder.shipping_address,
      billing_address: mockOrder.billing_address,
    };

    it('should create an order successfully', async () => {
      // Mock dependencies
      jest.spyOn(profileRepository, 'findOneBy').mockResolvedValue(mockProfile);
      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVariant]),
      } as any);
      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (cb) => await cb({
          create: jest.fn().mockReturnValue(mockOrder),
          save: jest.fn().mockReturnValue(mockOrder),
        }),
      );
      jest.spyOn(service, 'findOrderById').mockResolvedValue(mockOrder);

      const result = await service.createOrder('user123', createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: 'user123',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(profileRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.createOrder('user123', createOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when insufficient stock', async () => {
      jest.spyOn(profileRepository, 'findOneBy').mockResolvedValue(mockProfile);
      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { ...mockVariant, stock_quantity: 1 },
        ]),
      } as any);

      await expect(
        service.createOrder('user123', createOrderDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateOrder', () => {
    const updateOrderDto: UpdateOrderDto = {
      status: OrderStatus.CONFIRMED,
      staff_notes: 'Test note',
    };

    it('should update order successfully', async () => {
      jest
        .spyOn(orderRepository, 'findOne')
        .mockResolvedValue({ ...mockOrder, items: [] });
      jest
        .spyOn(orderRepository, 'save')
        .mockResolvedValue({ ...mockOrder, ...updateOrderDto });

      const result = await service.updateOrder('123', updateOrderDto);

      expect(result).toEqual({ ...mockOrder, ...updateOrderDto });
      expect(orderRepository.findOne).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateOrder('123', updateOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for invalid status transition', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue({
        ...mockOrder,
        items: [],
        status: OrderStatus.DELIVERED,
      });

      await expect(
        service.updateOrder('123', {
          status: OrderStatus.PROCESSING,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOrderById', () => {
    it('should return order when found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder);

      const result = await service.findOrderById('123');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['items', 'user'],
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOrderById('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOrdersByUser', () => {
    it('should return user orders', async () => {
      const mockOrders = [mockOrder];
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders);

      const result = await service.findOrdersByUser('user123');

      expect(result).toEqual(mockOrders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        relations: ['items'],
        order: { created_at: 'DESC' },
      });
    });
  });
});
