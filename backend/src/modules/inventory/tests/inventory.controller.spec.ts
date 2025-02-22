import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../controllers/inventory.controller';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { AdjustInventoryDto } from '../dtos/adjust-inventory.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

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
      variant_id: 'variant123',
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

      const result = await controller.getInventoryByVariant('variant123');

      expect(result).toEqual([mockInventoryItem]);
      expect(service.findInventoryByVariant).toHaveBeenCalledWith('variant123');
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
