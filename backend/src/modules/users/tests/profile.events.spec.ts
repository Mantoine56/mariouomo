import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Profile } from '../entities/profile.entity';
import { ProfileService } from '../services/profile.service';
import { UserStatus } from '../dtos/create-profile.dto';
import { Role } from '../../auth/enums/role.enum';

/**
 * Test suite for profile-related events
 */
describe('Profile Events', () => {
  let service: ProfileService;
  let eventEmitter: EventEmitter2;

  // Mock profile data
  const mockProfile: Profile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    full_name: 'John Doe',
    email: 'john@example.com',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    addresses: [],
    orders: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined
  };

  beforeEach(async () => {
    // Create testing module with mock dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            create: jest.fn().mockReturnValue(mockProfile),
            save: jest.fn().mockResolvedValue(mockProfile),
            findOne: jest.fn().mockResolvedValue(mockProfile),
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

    service = module.get<ProfileService>(ProfileService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Profile Creation Events', () => {
    it('should emit profile.created event when profile is created', async () => {
      // Arrange
      const createProfileDto = {
        full_name: 'John Doe',
        email: 'john@example.com',
        role: Role.USER, status: UserStatus.ACTIVE,
      };

      // Act
      await service.create(createProfileDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.created', mockProfile);
    });
  });

  describe('Profile Update Events', () => {
    it('should emit profile.updated event when profile is updated', async () => {
      // Arrange
      const updateProfileDto = {
        full_name: 'Updated Name',
      };

      // Act
      await service.update(mockProfile.id, updateProfileDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.updated', mockProfile);
    });

    it('should emit profile.status.updated event when profile status is updated', async () => {
      // Arrange
      const newStatus = UserStatus.INACTIVE;

      // Act
      await service.updateStatus(mockProfile.id, newStatus);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.status.updated', mockProfile);
    });
  });

  describe('Profile Deletion Events', () => {
    it('should emit profile.deleted event when profile is deleted', async () => {
      // Act
      await service.remove(mockProfile.id);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.deleted', { id: mockProfile.id });
    });
  });

  describe('Event Payload Structure', () => {
    it('should include all required fields in profile.created event', async () => {
      // Arrange
      const createProfileDto = {
        full_name: 'John Doe',
        email: 'john@example.com',
        role: Role.USER, status: UserStatus.ACTIVE,
      };

      // Act
      await service.create(createProfileDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.created', expect.objectContaining({
        id: expect.any(String),
        full_name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        status: expect.any(String),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      }));
    });

    it('should include all required fields in profile.updated event', async () => {
      // Arrange
      const updateProfileDto = {
        full_name: 'Updated Name',
      };

      // Act
      await service.update(mockProfile.id, updateProfileDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.updated', expect.objectContaining({
        id: expect.any(String),
        full_name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        status: expect.any(String),
        updated_at: expect.any(Date),
      }));
    });
  });
});
