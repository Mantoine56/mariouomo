import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { Profile } from '../entities/profile.entity';
import { ProfileService } from '../services/profile.service';
import { CreateProfileDto, UserStatus } from '../dtos/create-profile.dto';
import { Role } from '../../auth/enums/role.enum';

/**
 * Test suite for ProfileService
 */
describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;
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
            findAndCount: jest.fn().mockResolvedValue([[mockProfile], 1]),
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
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      // Arrange
      const createProfileDto: CreateProfileDto = {
        full_name: 'John Doe',
        email: 'john@example.com',
        role: Role.USER, status: UserStatus.ACTIVE,
      };

      // Act
      const result = await service.create(createProfileDto);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(repository.create).toHaveBeenCalledWith(createProfileDto);
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.created', mockProfile);
    });
  });

  describe('findAll', () => {
    it('should return an array of profiles and count', async () => {
      // Act
      const [profiles, count] = await service.findAll(0, 10);

      // Assert
      expect(profiles).toEqual([mockProfile]);
      expect(count).toEqual(1);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { created_at: 'DESC' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a profile by id', async () => {
      // Act
      const result = await service.findOne(mockProfile.id);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        relations: ['addresses']
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      // Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a profile by email', async () => {
      // Act
      const result = await service.findByEmail(mockProfile.email);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockProfile.email },
        relations: ['addresses']
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      // Assert
      await expect(service.findByEmail('non-existent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      // Arrange
      const updateProfileDto = { full_name: 'Updated Name' };

      // Act
      const result = await service.update(mockProfile.id, updateProfileDto);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.updated', mockProfile);
    });
  });

  describe('updateStatus', () => {
    it('should update profile status', async () => {
      // Arrange
      const newStatus = UserStatus.INACTIVE;

      // Act
      const result = await service.updateStatus(mockProfile.id, newStatus);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.status.updated', mockProfile);
    });
  });

  describe('remove', () => {
    it('should remove a profile', async () => {
      // Act
      await service.remove(mockProfile.id);

      // Assert
      expect(repository.remove).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('profile.deleted', { id: mockProfile.id });
    });
  });
});
