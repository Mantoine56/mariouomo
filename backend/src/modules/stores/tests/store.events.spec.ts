import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Store } from '../entities/store.entity';
import { StoreService } from '../services/store.service';

/**
 * Test suite for store-related events
 * Verifies that events are properly emitted during store operations
 */
describe('Store Events', () => {
  let service: StoreService;
  let eventEmitter: EventEmitter2;

  // Mock store data
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
    // Create testing module with mock dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useValue: {
            create: jest.fn().mockReturnValue(mockStore),
            save: jest.fn().mockResolvedValue(mockStore),
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
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Store Creation Events', () => {
    it('should emit store.created event when store is created', async () => {
      // Arrange
      const createStoreDto = {
        name: 'Test Store',
        description: 'Test Description',
        status: 'active',
        settings: { theme: 'dark' },
        metadata: { region: 'US' },
      };

      // Act
      await service.create(createStoreDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.created', mockStore);
    });
  });

  describe('Store Update Events', () => {
    it('should emit store.updated event when store is updated', async () => {
      // Arrange
      const updateStoreDto = {
        name: 'Updated Store',
      };

      // Act
      await service.update(mockStore.id, updateStoreDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.updated', mockStore);
    });

    it('should emit store.status.updated event when store status is updated', async () => {
      // Arrange
      const newStatus = 'inactive';

      // Act
      await service.updateStatus(mockStore.id, newStatus);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.status.updated', mockStore);
    });
  });

  describe('Store Deletion Events', () => {
    it('should emit store.deleted event when store is deleted', async () => {
      // Act
      await service.remove(mockStore.id);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.deleted', { id: mockStore.id });
    });
  });

  describe('Event Payload Structure', () => {
    it('should include all required fields in store.created event', async () => {
      // Arrange
      const createStoreDto = {
        name: 'Test Store',
        description: 'Test Description',
        status: 'active',
      };

      // Act
      await service.create(createStoreDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.created', expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        status: expect.any(String),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      }));
    });

    it('should include all required fields in store.updated event', async () => {
      // Arrange
      const updateStoreDto = {
        name: 'Updated Store',
      };

      // Act
      await service.update(mockStore.id, updateStoreDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('store.updated', expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        status: expect.any(String),
        updated_at: expect.any(Date),
      }));
    });
  });
});
