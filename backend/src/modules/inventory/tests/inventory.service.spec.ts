import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../services/inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: Repository<InventoryItem>;
  let variantRepository: Repository<ProductVariant>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  // Mock data
  const mockInventoryItem: Partial<InventoryItem> = {
    id: '123',
    variant_id: 'variant123',
    location: 'warehouse1',
    quantity: 100,
    reserved_quantity: 0,
    reorder_point: 10,
    reorder_quantity: 50,
  };

  const mockVariant: Partial<ProductVariant> = {
    id: 'variant123',
    name: 'Test Variant',
    sku: 'TEST-SKU-001',
  };

  const createDto = {
    variant_id: 'variant123',
    location: 'warehouse1',
    quantity: 100,
    reorder_point: 10,
    reorder_quantity: 50,
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn().mockResolvedValue([mockInventoryItem]),
      findOne: jest.fn().mockResolvedValue(mockInventoryItem),
      save: jest.fn().mockResolvedValue(mockInventoryItem),
      create: jest.fn().mockReturnValue(mockInventoryItem),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const mockEntityManager = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      create: jest.fn().mockReturnValue(mockInventoryItem),
      findOne: jest.fn().mockResolvedValue(mockInventoryItem),
      save: jest.fn().mockResolvedValue(mockInventoryItem),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockRepository,
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
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<Repository<InventoryItem>>(
      getRepositoryToken(InventoryItem),
    );
    variantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInventoryItem', () => {
    it('should create inventory item successfully', async () => {
      jest.spyOn(variantRepository, 'findOne').mockResolvedValueOnce(mockVariant as ProductVariant);
      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(inventoryRepository, 'create').mockReturnValueOnce(mockInventoryItem as InventoryItem);
      jest.spyOn(inventoryRepository, 'save').mockResolvedValueOnce(mockInventoryItem as InventoryItem);

      const result = await service.createInventoryItem(createDto);
      expect(result).toEqual(mockInventoryItem);
    });

    it('should throw NotFoundException when variant not found', async () => {
      jest.spyOn(variantRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.createInventoryItem(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when inventory exists', async () => {
      jest.spyOn(variantRepository, 'findOne').mockResolvedValueOnce(mockVariant as ProductVariant);
      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValueOnce(mockInventoryItem as InventoryItem);

      await expect(service.createInventoryItem(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('adjustInventory', () => {
    it('should adjust inventory quantity successfully', async () => {
      const adjustDto = {
        adjustment: 50,
        reason: 'Stock addition',
        reference: 'REF-123'
      };

      const updatedItem = {
        ...mockInventoryItem,
        quantity: mockInventoryItem.quantity! + adjustDto.adjustment,
      };

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
        create: jest.fn().mockReturnValue(mockInventoryItem),
        findOne: jest.fn().mockResolvedValue(mockInventoryItem),
        save: jest.fn().mockResolvedValue(updatedItem),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (cb: (entityManager: EntityManager) => Promise<any>) => {
          return cb(mockEntityManager as unknown as EntityManager);
        },
      );

      const result = await service.adjustInventory('123', adjustDto);
      expect(result.quantity).toBe(updatedItem.quantity);
    });

    it('should throw ConflictException when adjustment would result in negative quantity', async () => {
      const mockItem = {
        id: '123',
        quantity: 5,
        reorder_point: 10,
        variant_id: '123',
      };

      const adjustDto = {
        adjustment: -10,
        reason: 'Stock removal',
        reference: 'REF-124'
      };

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
        create: jest.fn().mockReturnValue(mockInventoryItem),
        findOne: jest.fn().mockResolvedValue(mockItem),
        save: jest.fn().mockRejectedValue(new ConflictException('Insufficient inventory')),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (cb: (entityManager: EntityManager) => Promise<any>) => {
          return cb(mockEntityManager as unknown as EntityManager);
        },
      );

      await expect(
        service.adjustInventory('123', adjustDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('reserveInventory', () => {
    it('should reserve inventory successfully', async () => {
      const mockItem = {
        ...mockInventoryItem,
        quantity: 100,
        reserved_quantity: 0,
      };

      const updatedItem = {
        ...mockItem,
        reserved_quantity: 10,
      };

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
        create: jest.fn().mockReturnValue(mockInventoryItem),
        findOne: jest.fn().mockResolvedValue(mockItem),
        save: jest.fn().mockResolvedValue(updatedItem),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (cb: (entityManager: EntityManager) => Promise<any>) => {
          return cb(mockEntityManager as unknown as EntityManager);
        },
      );

      const result = await service.reserveInventory('123', 10);
      expect(result.reserved_quantity).toBe(10);
    });

    it('should throw ConflictException when insufficient available inventory', async () => {
      const lowStockItem = {
        ...mockInventoryItem,
        quantity: 20,
        reserved_quantity: 15,
      };

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
        create: jest.fn().mockReturnValue(mockInventoryItem),
        findOne: jest.fn().mockResolvedValue(lowStockItem),
        save: jest.fn(),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(
        async (cb: (entityManager: EntityManager) => Promise<any>) => {
          return cb(mockEntityManager as unknown as EntityManager);
        },
      );

      await expect(service.reserveInventory('123', 10)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
