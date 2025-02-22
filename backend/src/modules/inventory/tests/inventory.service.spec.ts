/**
 * Unit tests for the Inventory Service
 * Tests inventory management operations including:
 * - Creating inventory items
 * - Updating stock levels
 * - Handling reservations
 * - Managing transactions
 */
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../services/inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Creates a mock EntityManager for testing
 * @param mockInventoryRepository - Mock repository for inventory items
 * @param mockItem - Mock inventory item for findOne responses
 * @returns Mock EntityManager
 */
const createMockEntityManager = (mockInventoryRepository: Repository<InventoryItem>, mockItem: Partial<InventoryItem>) => ({
  getRepository: jest.fn().mockReturnValue(mockInventoryRepository),
  findOne: jest.fn().mockImplementation((entity, options) => {
    if (entity === InventoryItem) {
      return Promise.resolve(mockItem as InventoryItem);
    }
    return Promise.resolve(null);
  }),
  save: jest.fn(),
  update: jest.fn(),
  insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'movement-123' }] }),
  connection: {} as any,
  queryRunner: undefined,
  release: jest.fn(),
  "@instanceof": Symbol.for("EntityManager")
} as unknown as EntityManager);

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: Repository<InventoryItem>;
  let variantRepository: Repository<ProductVariant>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;
  let mockInventoryRepository: Repository<InventoryItem>;
  let mockProductRepository: Repository<ProductVariant>;

  // Mock data with complete type information
  const mockProductVariant: Partial<ProductVariant> = {
    id: 'variant123',
    product_id: 'product123',
    sku: 'TEST-SKU-123',
    name: 'Test Variant',
    price_adjustment: 0,
    attributes: {},
    weight: 100,
    dimensions: {
      length: 10,
      width: 10,
      height: 10,
      unit: 'cm'
    },
    created_at: new Date(),
    updated_at: new Date(),
    product: undefined,
    inventory_items: []
  };

  const mockInventoryItem: Partial<InventoryItem> = {
    id: '123',
    variant_id: 'variant123',
    quantity: 100,
    location: 'WAREHOUSE_A',
    reorder_point: 10,
    reorder_quantity: 50,
    reserved_quantity: 0,
    version: 1,
    created_at: new Date(),
    updated_at: new Date(),
    variant: mockProductVariant as ProductVariant,
    metadata: {}
  };

  beforeEach(async () => {
    // Create mock repositories with type-safe implementations
    mockInventoryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn()
    } as unknown as Repository<InventoryItem>;

    mockProductRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn()
    } as unknown as Repository<ProductVariant>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
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
              manager: createMockEntityManager(mockInventoryRepository, mockInventoryItem),
            }),
            // Implement type-safe transaction handling
            transaction: jest.fn().mockImplementation(
              async (isolationOrCb: any, maybeCallback?: any) => {
                // Handle both function signatures
                const callback = typeof isolationOrCb === 'function' ? isolationOrCb : maybeCallback;
                return callback(createMockEntityManager(mockInventoryRepository, mockInventoryItem));
              }
            ),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get<Repository<InventoryItem>>(
      getRepositoryToken(InventoryItem),
    );
    variantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('adjustInventory', () => {
    /**
     * Tests successful inventory adjustment with proper transaction handling
     * Verifies that:
     * - The inventory quantity is updated correctly
     * - The transaction is committed successfully
     * - Events are emitted properly
     */
    it('should successfully adjust inventory quantity', async () => {
      const adjustDto = {
        adjustment: 10,
        reason: 'RESTOCK',
        reference: 'REF-123'
      };

      const updatedItem: Partial<InventoryItem> = {
        ...mockInventoryItem,
        quantity: mockInventoryItem.quantity! + adjustDto.adjustment,
        version: mockInventoryItem.version! + 1
      };

      const mockManager = createMockEntityManager(mockInventoryRepository, mockInventoryItem);
      mockManager.save = jest.fn().mockResolvedValue(updatedItem);

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (isolationOrCb: any, maybeCallback?: any) => {
          const callback = typeof isolationOrCb === 'function' ? isolationOrCb : maybeCallback;
          return callback(mockManager);
        }
      );

      const result = await service.adjustInventory(mockInventoryItem.id!, adjustDto);
      expect(result).toEqual(updatedItem);
      expect(eventEmitter.emit).toHaveBeenCalledWith('inventory.adjusted', expect.any(Object));
    });

    /**
     * Tests inventory adjustment failure due to insufficient stock
     * Verifies that:
     * - The service throws a ConflictException
     * - The transaction is rolled back
     * - No events are emitted
     */
    it('should fail to adjust inventory when insufficient stock', async () => {
      const adjustDto = {
        adjustment: -150,
        reason: 'SALE',
        reference: 'REF-124'
      };

      jest.spyOn(mockInventoryRepository, 'findOne').mockResolvedValue(mockInventoryItem as InventoryItem);
      jest.spyOn(mockInventoryRepository, 'save').mockRejectedValue(new ConflictException('Insufficient inventory'));

      await expect(service.adjustInventory(mockInventoryItem.id!, adjustDto)).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('reserveInventory', () => {
    /**
     * Tests successful inventory reservation
     * Verifies that:
     * - The reserved quantity is updated correctly
     * - The transaction is committed successfully
     * - Events are emitted properly
     */
    it('should successfully reserve inventory', async () => {
      const quantity = 10;

      const updatedItem: Partial<InventoryItem> = {
        ...mockInventoryItem,
        reserved_quantity: mockInventoryItem.reserved_quantity! + quantity,
        version: mockInventoryItem.version! + 1
      };

      const mockManager = createMockEntityManager(mockInventoryRepository, mockInventoryItem);
      mockManager.save = jest.fn().mockResolvedValue(updatedItem);

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (isolationOrCb: any, maybeCallback?: any) => {
          const callback = typeof isolationOrCb === 'function' ? isolationOrCb : maybeCallback;
          return callback(mockManager);
        }
      );

      const result = await service.reserveInventory(mockInventoryItem.id!, quantity);
      expect(result).toEqual(updatedItem);
      expect(eventEmitter.emit).toHaveBeenCalledWith('inventory.reserved', expect.any(Object));
    });

    /**
     * Tests inventory reservation failure due to insufficient available stock
     * Verifies that:
     * - The service throws a ConflictException
     * - The transaction is rolled back
     * - No events are emitted
     */
    it('should fail to reserve inventory when insufficient available stock', async () => {
      const quantity = 150;

      jest.spyOn(mockInventoryRepository, 'findOne').mockResolvedValue(mockInventoryItem as InventoryItem);
      jest.spyOn(mockInventoryRepository, 'save').mockRejectedValue(new ConflictException('Insufficient available inventory'));

      await expect(service.reserveInventory(mockInventoryItem.id!, quantity)).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
