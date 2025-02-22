import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../controllers/inventory.controller';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { AdjustInventoryDto } from '../dtos/adjust-inventory.dto';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryItem } from '../entities/inventory-item.entity';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockProduct = {
    id: '123',
    name: 'Test Product',
    description: 'A test product',
    category_id: 'cat123',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockVariant = {
    id: '456',
    product_id: '123',
    sku: 'TEST-SKU-1',
    name: 'Test Variant',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockInventoryItem = {
    id: '123',
    variant_id: mockVariant.id,
    variant: mockVariant as ProductVariant,
    location: 'Warehouse A',
    quantity: 100,
    reserved_quantity: 0,
    reorder_point: 10,
    reorder_quantity: 50,
    version: 1,
    created_at: new Date('2025-02-22T13:00:00Z'),
    updated_at: new Date('2025-02-22T13:00:00Z')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            createInventoryItem: jest.fn(),
            updateInventoryItem: jest.fn(),
            adjustInventory: jest.fn(),
            getLowStockItems: jest.fn(),
            findInventoryById: jest.fn(),
            findInventoryByVariant: jest.fn(),
            findInventoryByLocation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInventoryItem', () => {
    const createDto: CreateInventoryDto = {
      variant_id: '456',
      location: 'Warehouse A',
      quantity: 100,
      reorder_point: 10,
      reorder_quantity: 50,
    };

    it('should create inventory item', async () => {
      jest
        .spyOn(service, 'createInventoryItem')
        .mockResolvedValue(mockInventoryItem);

      const result = await controller.createInventoryItem(createDto);

      expect(result).toEqual(mockInventoryItem);
      expect(service.createInventoryItem).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateInventoryItem', () => {
    const updateDto: UpdateInventoryDto = {
      reorder_point: 20,
      reorder_quantity: 100,
    };

    it('should update inventory item', async () => {
      const updatedItem = { ...mockInventoryItem, ...updateDto };
      jest
        .spyOn(service, 'updateInventoryItem')
        .mockResolvedValue(updatedItem);

      const result = await controller.updateInventoryItem('123', updateDto);

      expect(result).toEqual(updatedItem);
      expect(service.updateInventoryItem).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('adjustInventory', () => {
    const adjustDto: AdjustInventoryDto = {
      adjustment: -10,
      reason: 'Order fulfillment',
      reference: 'ORDER-123',
    };

    it('should adjust inventory quantity', async () => {
      const adjustedItem = {
        ...mockInventoryItem,
        quantity: mockInventoryItem.quantity + adjustDto.adjustment,
      };
      jest.spyOn(service, 'adjustInventory').mockResolvedValue(adjustedItem);

      const result = await controller.adjustInventory('123', adjustDto);

      expect(result).toEqual(adjustedItem);
      expect(service.adjustInventory).toHaveBeenCalledWith('123', adjustDto);
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items', async () => {
      jest
        .spyOn(service, 'getLowStockItems')
        .mockResolvedValue([mockInventoryItem]);

      const result = await controller.getLowStockItems();

      expect(result).toEqual([mockInventoryItem]);
      expect(service.getLowStockItems).toHaveBeenCalled();
    });
  });

  describe('getInventoryItem', () => {
    it('should return inventory item by id', async () => {
      jest
        .spyOn(service, 'findInventoryById')
        .mockResolvedValue(mockInventoryItem);

      const result = await controller.getInventoryItem('123');

      expect(result).toEqual(mockInventoryItem);
      expect(service.findInventoryById).toHaveBeenCalledWith('123');
    });
  });

  describe('getInventoryByVariant', () => {
    it('should return inventory items by variant', async () => {
      jest
        .spyOn(service, 'findInventoryByVariant')
        .mockResolvedValue([mockInventoryItem]);

      const result = await controller.getInventoryByVariant('456');

      expect(result).toEqual([mockInventoryItem]);
      expect(service.findInventoryByVariant).toHaveBeenCalledWith('456');
    });
  });

  describe('getInventoryByLocation', () => {
    it('should return inventory items by location', async () => {
      jest
        .spyOn(service, 'findInventoryByLocation')
        .mockResolvedValue([mockInventoryItem]);

      const result = await controller.getInventoryByLocation('Warehouse A');

      expect(result).toEqual([mockInventoryItem]);
      expect(service.findInventoryByLocation).toHaveBeenCalledWith('Warehouse A');
    });
  });
});
