import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../services/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Profile } from '../../users/entities/profile.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';
import { ShipmentStatus } from '../../shipments/enums/shipment-status.enum';
import { PaymentMethod } from '../../payments/enums/payment-method.enum';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
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

  const mockProfile: Profile = {
    id: '123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'customer',
    status: 'active',
    orders: [],
    addresses: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOrder: Order = {
    id: 'order123',
    user_id: mockProfile.id,
    user: mockProfile,
    status: OrderStatus.PENDING,
    total_amount: 100,
    subtotal: 90,
    tax: 10,
    items: [],
    payments: [{
      id: 'payment123',
      order_id: 'order123',
      amount: 100,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CREDIT_CARD,
      transaction_id: 'tx123',
      order: null as any,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    shipments: [{
      id: 'shipment123',
      order_id: 'order123',
      status: ShipmentStatus.PENDING,
      tracking_number: 'track123',
      shipping_method: 'standard',
      order: null as any,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    staff_notes: '',
    customer_notes: '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockVariant: ProductVariant = {
    id: 'variant123',
    name: 'Test Variant',
    price: 50,
    stock_quantity: 10,
    product_name: 'Test Product',
    sku: 'TEST-123',
  };

  beforeEach(async () => {
    const mockOrderRepository = {
      find: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      save: jest.fn().mockResolvedValue(mockOrder),
      create: jest.fn().mockReturnValue(mockOrder),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const mockOrderItemRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockVariantRepository = {
      findOne: jest.fn().mockResolvedValue(mockVariant),
      save: jest.fn(),
      increment: jest.fn(),
    };

    const mockProfileRepository = {
      findOne: jest.fn().mockResolvedValue(mockProfile),
    };

    const mockEntityManager = {
      getRepository: jest.fn((entity) => {
        if (entity === Order) return mockOrderRepository;
        if (entity === OrderItem) return mockOrderItemRepository;
        if (entity === ProductVariant) return mockVariantRepository;
        if (entity === Profile) return mockProfileRepository;
      }),
      create: jest.fn().mockReturnValue(mockOrder),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      save: jest.fn().mockResolvedValue(mockOrder),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockVariantRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: mockEntityManager,
            }),
            transaction: jest.fn().mockImplementation(
              async (cb: (entityManager: EntityManager) => Promise<any>) => {
                return cb(mockEntityManager as unknown as EntityManager);
              },
            ),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    variantRepository = module.get<Repository<ProductVariant>>(getRepositoryToken(ProductVariant));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
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
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile);
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
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        id: 'user123',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createOrder('user123', createOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when insufficient stock', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile);
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
