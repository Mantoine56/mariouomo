import { EntityManager, DeepPartial, FindOptionsWhere, UpdateResult, FindOneOptions, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Type } from '@nestjs/common';

/**
 * Base repository class that provides common CRUD operations
 * Implements soft delete pattern and basic error handling
 * Uses composition pattern for better compatibility with newer TypeORM versions
 */
export abstract class BaseRepository<T extends BaseEntity> {  
  protected repository: Repository<T>;
  
  constructor(
    private readonly entityType: Type<T>,
    private readonly entityManager: EntityManager
  ) {
    this.repository = entityManager.getRepository<T>(entityType);
  }
  /**
   * Creates a new entity instance
   * @param data Entity data
   * @returns Created entity
   */
  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
  
  /**
   * Creates a new entity instance without saving
   * @param data Entity data
   * @returns Created entity (not saved)
   */
  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }
  
  /**
   * Saves an entity to the database
   * @param entity Entity to save
   * @returns Saved entity
   */
  save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }
  
  /**
   * Finds entities based on provided options
   * @param options Find options
   * @returns Array of entities
   */
  find(options?: FindOneOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }
  
  /**
   * Finds a single entity based on provided options
   * @param options Find options
   * @returns Entity or null
   */
  findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }
  
  /**
   * Updates entities matching criteria
   * @param criteria Update criteria
   * @param partialEntity Update data
   * @returns Update result
   */
  update(criteria: string | FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
    return this.repository.update(criteria, partialEntity);
  }

  /**
   * Finds an entity by ID with optional relations
   * @param id Entity ID
   * @param relations Optional relations to load
   * @returns Found entity or throws NotFoundException
   */
  async findByIdOrFail(id: string, relations: string[] = []): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }

    return entity;
  }

  /**
   * Updates an entity by ID
   * @param id Entity ID
   * @param data Update data
   * @returns Updated entity
   */
  async updateEntity(
    id: string,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    await this.repository.update(id, data);
    return this.findByIdOrFail(id);
  }

  /**
   * Soft deletes an entity by ID
   * @param id Entity ID
   * @returns UpdateResult
   */
  async softDeleteEntity(id: string): Promise<UpdateResult> {
    const result = await this.repository.update(id, {
      deleted_at: new Date(),
    } as unknown as QueryDeepPartialEntity<T>);

    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    
    return result;
  }
  
  /**
   * Soft delete method for compatibility
   * @param criteria Entity ID or criteria
   * @returns UpdateResult
   */
  softDelete(criteria: string | FindOptionsWhere<T>): Promise<UpdateResult> {
    if (typeof criteria === 'string') {
      return this.softDeleteEntity(criteria);
    }
    
    // Use the repository implementation for other criteria types
    return this.repository.softDelete(criteria);
  }

  /**
   * Restores a soft-deleted entity
   * @param id Entity ID
   * @returns UpdateResult
   */
  async restoreEntity(id: string): Promise<UpdateResult> {
    const result = await this.repository.update(id, {
      deleted_at: null,
    } as unknown as QueryDeepPartialEntity<T>);

    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    
    return result;
  }
  
  /**
   * Restore method for compatibility
   * @param criteria Entity ID or criteria
   * @returns UpdateResult
   */
  restore(criteria: string | FindOptionsWhere<T>): Promise<UpdateResult> {
    if (typeof criteria === 'string') {
      return this.restoreEntity(criteria);
    }
    
    // Use the repository implementation for other criteria types
    return this.repository.restore(criteria);
  }
  
  /**
   * Creates a query builder for this entity
   * @param alias Entity alias
   * @returns Query builder
   */
  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
