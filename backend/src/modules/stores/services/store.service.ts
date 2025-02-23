import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service handling store-related business logic
 */
@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new store
   * @param createStoreDto Store creation data
   * @returns Newly created store
   */
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create(createStoreDto);
    await this.storeRepository.save(store);
    
    this.eventEmitter.emit('store.created', store);
    return store;
  }

  /**
   * Find all stores with optional pagination
   * @param skip Number of records to skip
   * @param take Number of records to take
   * @returns Array of stores
   */
  async findAll(skip = 0, take = 10): Promise<[Store[], number]> {
    return this.storeRepository.findAndCount({
      skip,
      take,
      relations: ['products']
    });
  }

  /**
   * Find a store by ID
   * @param id Store ID
   * @returns Store if found
   * @throws NotFoundException if store not found
   */
  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['products']
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  /**
   * Update a store
   * @param id Store ID
   * @param updateStoreDto Update data
   * @returns Updated store
   * @throws NotFoundException if store not found
   */
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    
    Object.assign(store, updateStoreDto);
    await this.storeRepository.save(store);
    
    this.eventEmitter.emit('store.updated', store);
    return store;
  }

  /**
   * Delete a store
   * @param id Store ID
   * @returns void
   * @throws NotFoundException if store not found
   */
  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    
    await this.storeRepository.remove(store);
    this.eventEmitter.emit('store.deleted', { id });
  }

  /**
   * Update store status
   * @param id Store ID
   * @param status New status
   * @returns Updated store
   * @throws NotFoundException if store not found
   */
  async updateStatus(id: string, status: string): Promise<Store> {
    const store = await this.findOne(id);
    
    store.status = status;
    await this.storeRepository.save(store);
    
    this.eventEmitter.emit('store.status.updated', store);
    return store;
  }
}
