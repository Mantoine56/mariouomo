import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../services/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm'; 
import { Order } from '../entities/order.entity';
import { Profile } from '../../users/entities/profile.entity';
import { OrderStatus } from '../entities/order.entity';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';
import { ShipmentStatus } from '../../shipments/enums/shipment-status.enum';
import { PaymentMethod } from '../../payments/enums/payment-method.enum';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let variantRepository: Repository<ProductVariant>;
  let profileRepository: Repository<Profile>;
  let inventoryItemRepository: Repository<InventoryItem>;
  let productRepository: Repository<Product>;
  let dataSource: DataSource;
  let mockEntityManager: any;

  const mockProfile: Profile = {
    id: '123',
    full_name: 'John Doe',
    role: 'customer',
    status: 'active',
    email: 'john@example.com',
    phone: '1234567890',
    preferences: {},
    metadata: {},
    orders: [],
    addresses: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockStore: Store = {
    id: 'store123',
    name: 'Test Store',
    description: 'Test Store Description',
    status: 'active',
    products: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProduct: Product = {
    id: 'product123',
    store_id: 'store123',
    name: 'Test Product',
    description: 'Test Description',
    base_price: 100,
    status: 'active',
    type: 'physical',
    category: 'test',
    tags: ['test'],
    seo_metadata: {},
    attributes: {},
    store: mockStore,
    variants: [],
    images: [],
    categories: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockVariant: ProductVariant = {
    id: 'variant123',
    product_id: mockProduct.id,
    name: 'Test Variant',
    sku: 'TEST-123',
    barcode: 'BARCODE-123',
    price_adjustment: 0,
    option_values: {
      color: 'Blue',
      size: 'Medium'
    },
    position: 1,
    product: mockProduct,
    inventory_items: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockInventoryItem: InventoryItem = {
    id: 'inventory123',
    variant_id: mockVariant.id,
    quantity: 10,
    reserved_quantity: 0,
    location: 'warehouse1',
    reorder_point: 5,
    reorder_quantity: 20,
    version: 1,
    variant: mockVariant,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOrder: Order = {
    id: 'order123',
    store_id: 'store123',
    user_id: 'user123',
    user: {} as Profile,
    status: OrderStatus.PENDING as OrderStatus,
    total_amount: 100,
    subtotal_amount: 90,
    tax_amount: 10,
    shipping_amount: 10,
    discount_amount: 0,
    shipping_address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'Test Country'
    },
    billing_address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'Test Country'
    },
    items: [],
    payments: [{
      id: 'payment123',
      order_id: 'order123',
      amount: 100,
      status: PaymentStatus.PENDING as PaymentStatus,
      method: PaymentMethod.CREDIT_CARD as PaymentMethod,
      transaction_id: 'tx123',
      order: null as any,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    shipments: [{
      id: 'shipment123',
      order_id: 'order123',
      status: ShipmentStatus.PENDING as ShipmentStatus,
      tracking_number: 'track123',
      shipping_provider: 'standard',
      order: null as any,
      created_at: new Date(),
      updated_at: new Date(),
    }],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockOrderRepository = {
      find: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      save: jest.fn().mockResolvedValue(mockOrder),
      create: jest.fn().mockReturnValue(mockOrder),
    };

    const mockOrderItemRepository = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
    };

    const mockVariantRepository = {
      findOne: jest.fn().mockResolvedValue(mockVariant),
      save: jest.fn().mockResolvedValue(mockVariant),
      createQueryBuilder: jest.fn().mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVariant]),
      }),
    };

    const mockInventoryItemRepository = {
      findOne: jest.fn().mockResolvedValue(mockInventoryItem),
      save: jest.fn().mockResolvedValue(mockInventoryItem),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInventoryItem),
      }),
    };

    const mockProductRepository = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
      save: jest.fn().mockResolvedValue(mockProduct),
    };

    const mockProfileRepository = {
      findOneBy: jest.fn().mockResolvedValue(mockProfile),
      findOne: jest.fn().mockResolvedValue(mockProfile),
    };

    mockEntityManager = {
      getRepository: jest.fn((entity) => {
        if (entity === Order) return mockOrderRepository;
        if (entity === OrderItem) return mockOrderItemRepository;
        if (entity === ProductVariant) return mockVariantRepository;
        if (entity === Profile) return mockProfileRepository;
        if (entity === InventoryItem) return mockInventoryItemRepository;
        if (entity === Product) return mockProductRepository;
      }),
      create: jest.fn().mockReturnValue(mockOrder),
      findOne: jest.fn().mockImplementation((entity, options) => {
        if (entity === Product) return mockProduct;
        if (entity === InventoryItem) return mockInventoryItem;
        return mockOrder;
      }),
      save: jest.fn().mockReturnValue(mockOrder),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      transaction: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInventoryItem),
      }),
      "@instanceof": Symbol.for("EntityManager"),
      connection: {},
      repositories: new Map(),
      queryRunner: {},
      manager: {},
      withRepository: jest.fn(),
      release: jest.fn(),
      increment: jest.fn().mockResolvedValue({}),
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
          provide: getRepositoryToken(InventoryItem),
          useValue: mockInventoryItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
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
              async (isolationOrCb: any, maybeCallback?: any) => {
                const callback = maybeCallback || isolationOrCb;
                const mockEntityManager = {
                  create: jest.fn().mockReturnValue(mockOrder),
                  save: jest.fn().mockResolvedValue(mockOrder),
                  createQueryBuilder: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnThis(),
                    getOne: jest.fn().mockResolvedValue(mockInventoryItem),
                  }),
                };
                return callback(mockEntityManager as unknown as EntityManager);
              }
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
    inventoryItemRepository = module.get<Repository<InventoryItem>>(getRepositoryToken(InventoryItem));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto = {
      store_id: 'store123',
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
      
      // Mock variant query builder
      const variantQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVariant]),
      };

      // Mock inventory query builder
      const inventoryQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInventoryItem),
      };

      // Mock manager's createQueryBuilder
      const mockManagerCreateQueryBuilder = jest.fn().mockImplementation((entity: any, alias: string) => {
        if (entity === ProductVariant) {
          return variantQueryBuilder;
        }
        // Default to inventory query builder for all other cases
        return inventoryQueryBuilder;
      });

      const mockEntityManager = {
        create: jest.fn().mockReturnValue(mockOrder),
        save: jest.fn().mockResolvedValue(mockOrder),
        createQueryBuilder: mockManagerCreateQueryBuilder,
        findOne: jest.fn().mockResolvedValue(mockProduct),
      };

      // Mock transaction
      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (isolationOrCb: any, maybeCallback?: any) => {
          const callback = maybeCallback || isolationOrCb;
          return callback(mockEntityManager as unknown as EntityManager);
        }
      );

      jest.spyOn(service, 'findOrderById').mockResolvedValue(mockOrder);

      const result = await service.createOrder('user123', createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({ id: 'user123' });
      expect(mockManagerCreateQueryBuilder).toHaveBeenCalledWith(ProductVariant, 'variant');
      expect(variantQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(profileRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.createOrder('user123', createOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when insufficient stock', async () => {
      jest.spyOn(profileRepository, 'findOneBy').mockResolvedValue(mockProfile);
      
      // Mock variant query builder
      const variantQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVariant]),
      };

      // Mock inventory query builder with low stock
      const mockInventoryItemLowStock = {
        ...mockInventoryItem,
        quantity: 1,
      };

      const inventoryQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInventoryItemLowStock),
      };

      // Mock manager's createQueryBuilder
      const mockManagerCreateQueryBuilder = jest.fn().mockImplementation((entity: any, alias: string) => {
        if (entity === ProductVariant) {
          return variantQueryBuilder;
        }
        // Default to inventory query builder for all other cases
        return inventoryQueryBuilder;
      });

      const mockEntityManager = {
        create: jest.fn().mockReturnValue(mockOrder),
        save: jest.fn().mockResolvedValue(mockOrder),
        createQueryBuilder: mockManagerCreateQueryBuilder,
        findOne: jest.fn().mockResolvedValue(mockProduct),
      };

      // Mock transaction
      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (isolationOrCb: any, maybeCallback?: any) => {
          const callback = maybeCallback || isolationOrCb;
          return callback(mockEntityManager as unknown as EntityManager);
        }
      );

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
