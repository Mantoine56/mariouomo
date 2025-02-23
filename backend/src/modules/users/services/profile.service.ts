import { Injectable, NotFoundException } from '@nestjs/common';
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
    const profile = this.profileRepository.create(createProfileDto);
    const savedProfile = await this.profileRepository.save(profile);
    
    this.eventEmitter.emit('profile.created', savedProfile);
    return savedProfile;
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
    const profile = await this.findOne(id);
    
    Object.assign(profile, updateProfileDto);
    const updatedProfile = await this.profileRepository.save(profile);
    
    this.eventEmitter.emit('profile.updated', updatedProfile);
    return updatedProfile;
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
