import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

/**
 * Service responsible for managing user profiles
 * Handles CRUD operations and emits relevant events
 */
@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new user profile
   * @param createProfileDto Data for creating a new profile
   * @returns Newly created profile
   */
  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    try {
      // Handle potential field mapping between DTO and entity
      // If the DTO has first_name and last_name but entity uses full_name
      const profileData = { ...createProfileDto };
      
      // Combine first_name and last_name into full_name if needed
      if (!profileData.full_name && profileData.first_name && profileData.last_name) {
        profileData.full_name = `${profileData.first_name} ${profileData.last_name}`;
      }
      
      // Map phone_number to phone if needed
      if (!profileData.phone && profileData.phone_number) {
        profileData.phone = profileData.phone_number;
      }
      
      const profile = this.profileRepository.create(profileData);
      const savedProfile = await this.profileRepository.save(profile);
      
      this.eventEmitter.emit('profile.created', savedProfile);
      return savedProfile;
    } catch (error) {
      this.logger.error(`Failed to create profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all profiles with pagination
   * @param skip Number of records to skip
   * @param take Number of records to take
   * @returns Array of profiles and total count
   */
  async findAll(skip = 0, take = 10): Promise<[Profile[], number]> {
    return this.profileRepository.findAndCount({
      skip,
      take,
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Find a profile by ID
   * @param id Profile ID
   * @returns Found profile or throws NotFoundException
   */
  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['addresses']
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID "${id}" not found`);
    }

    return profile;
  }

  /**
   * Find a profile by email
   * @param email User's email
   * @returns Found profile or throws NotFoundException
   */
  async findByEmail(email: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { email },
      relations: ['addresses']
    });

    if (!profile) {
      throw new NotFoundException(`Profile with email "${email}" not found`);
    }

    return profile;
  }

  /**
   * Update a profile
   * @param id Profile ID
   * @param updateProfileDto Data for updating the profile
   * @returns Updated profile
   */
  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    try {
      const profile = await this.findOne(id);
      
      // Handle potential field mapping between DTO and entity
      const updateData = { ...updateProfileDto };
      
      // Combine first_name and last_name into full_name if needed
      if (updateData.first_name || updateData.last_name) {
        const firstName = updateData.first_name || profile.first_name || '';
        const lastName = updateData.last_name || profile.last_name || '';
        updateData.full_name = `${firstName} ${lastName}`.trim();
      }
      
      // Map phone_number to phone if needed
      if (updateData.phone_number && !updateData.phone) {
        updateData.phone = updateData.phone_number;
      }
      
      Object.assign(profile, updateData);
      const updatedProfile = await this.profileRepository.save(profile);
      
      this.eventEmitter.emit('profile.updated', updatedProfile);
      return updatedProfile;
    } catch (error) {
      this.logger.error(`Failed to update profile ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a profile's status
   * @param id Profile ID
   * @param status New status
   * @returns Updated profile
   */
  async updateStatus(id: string, status: string): Promise<Profile> {
    const profile = await this.findOne(id);
    
    profile.status = status;
    const updatedProfile = await this.profileRepository.save(profile);
    
    this.eventEmitter.emit('profile.status.updated', updatedProfile);
    return updatedProfile;
  }

  /**
   * Delete a profile
   * @param id Profile ID
   */
  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    await this.profileRepository.remove(profile);
    
    this.eventEmitter.emit('profile.deleted', { id });
  }
}
