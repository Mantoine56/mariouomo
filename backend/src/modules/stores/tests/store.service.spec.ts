import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Store } from '../entities/store.entity';
import { StoreService } from '../services/store.service';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';
import { NotFoundException } from '@nestjs/common';

describe('StoreService', () => {
  let service: StoreService;
  let repository: Repository<Store>;
  let eventEmitter: EventEmitter2;

  const mockStore: Store = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Store',
    description: 'Test Description',
    status: 'active',
    settings: { theme: 'dark' },
    metadata: { region: 'US' },
    products: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useValue: {
            create: jest.fn().mockReturnValue(mockStore),
            save: jest.fn().mockResolvedValue(mockStore),
            findAndCount: jest.fn().mockResolvedValue([[mockStore], 1]),
            findOne: jest.fn().mockResolvedValue(mockStore),
            remove: jest.fn().mockResolvedValue(undefined),
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

    service = module.get<StoreService>(StoreService);
    repository = module.get<Repository<Store>>(getRepositoryToken(Store));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('create', () => {
    it('should create a new store', async () => {
      const createStoreDto: CreateStoreDto = {
        name: 'Test Store',
        description: 'Test Description',
        status: 'active',
        settings: { theme: 'dark' },
        metadata: { region: 'US' },
      };

      const result = await service.create(createStoreDto);

      expect(repository.create).toHaveBeenCalledWith(createStoreDto);
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.created', mockStore);
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should return an array of stores with count', async () => {
      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['products'],
      });
      expect(result).toEqual([[mockStore], 1]);
    });

    it('should handle pagination', async () => {
      await service.findAll(10, 20);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
        relations: ['products'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      const result = await service.findOne(mockStore.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockStore.id },
        relations: ['products'],
      });
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException when store not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
      };

      const result = await service.update(mockStore.id, updateStoreDto);

      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.updated', mockStore);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException when store not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', { name: 'Updated Store' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a store', async () => {
      await service.remove(mockStore.id);

      expect(repository.remove).toHaveBeenCalledWith(mockStore);
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.deleted', {
        id: mockStore.id,
      });
    });

    it('should throw NotFoundException when store not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update store status', async () => {
      const result = await service.updateStatus(mockStore.id, 'inactive');

      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'store.status.updated',
        mockStore,
      );
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException when store not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.updateStatus('non-existent', 'inactive'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
