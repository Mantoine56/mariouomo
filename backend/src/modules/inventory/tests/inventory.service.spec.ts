import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../services/inventory.service';
import { InventoryItem } from '../entities/inventory-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { AdjustInventoryDto } from '../dtos/adjust-inventory.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: Repository<InventoryItem>;
  let variantRepository: Repository<ProductVariant>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  const mockInventoryItem = {
    id: '123',
    variant_id: 'variant123',
    location: 'Warehouse A',
    quantity: 100,
    reserved_quantity: 0,
    reorder_point: 10,
    reorder_quantity: 50,
    version: 1,
  };

  const mockVariant = {
    id: 'variant123',
    name: 'Test Variant',
    sku: 'TEST-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
            createQueryBuilder: jest.fn(),
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
    const createDto: CreateInventoryDto = {
      variant_id: 'variant123',
      location: 'Warehouse A',
      quantity: 100,
      reorder_point: 10,
      reorder_quantity: 50,
    };

    it('should create inventory item successfully', async () => {
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValueOnce(mockVariant).mockResolvedValueOnce(null),
          create: jest.fn().mockReturnValue(mockInventoryItem),
          save: jest.fn().mockResolvedValue(mockInventoryItem),
        });
      });

      const result = await service.createInventoryItem(createDto);

      expect(result).toEqual(mockInventoryItem);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.created',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when variant not found', async () => {
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(null),
        });
      });

      await expect(service.createInventoryItem(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when inventory exists', async () => {
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest
            .fn()
            .mockResolvedValueOnce(mockVariant)
            .mockResolvedValueOnce(mockInventoryItem),
        });
      });

      await expect(service.createInventoryItem(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('adjustInventory', () => {
    const adjustDto: AdjustInventoryDto = {
      adjustment: -10,
      reason: 'Order fulfillment',
      reference: 'ORDER-123',
    };

    it('should adjust inventory successfully', async () => {
      const updatedItem = {
        ...mockInventoryItem,
        quantity: mockInventoryItem.quantity + adjustDto.adjustment,
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(mockInventoryItem),
          save: jest.fn().mockResolvedValue(updatedItem),
          insert: jest.fn(),
        });
      });

      const result = await service.adjustInventory('123', adjustDto);

      expect(result.quantity).toBe(90);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.decreased',
        expect.any(Object),
      );
    });

    it('should throw ConflictException when insufficient inventory', async () => {
      const largeAdjustment: AdjustInventoryDto = {
        adjustment: -150,
        reason: 'Test adjustment',
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(mockInventoryItem),
        });
      });

      await expect(
        service.adjustInventory('123', largeAdjustment),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('reserveInventory', () => {
    it('should reserve inventory successfully', async () => {
      const updatedItem = {
        ...mockInventoryItem,
        reserved_quantity: 10,
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(mockInventoryItem),
          save: jest.fn().mockResolvedValue(updatedItem),
        });
      });

      const result = await service.reserveInventory('123', 10);

      expect(result.reserved_quantity).toBe(10);
    });

    it('should throw ConflictException when insufficient available inventory', async () => {
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue({
            ...mockInventoryItem,
            quantity: 20,
            reserved_quantity: 15,
          }),
        });
      });

      await expect(service.reserveInventory('123', 10)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInventoryItem]),
      };

      jest
        .spyOn(inventoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.getLowStockItems();

      expect(result).toEqual([mockInventoryItem]);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
