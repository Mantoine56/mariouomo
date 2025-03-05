import { Repository, DeepPartial, FindOptionsWhere, UpdateResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * Base repository class that provides common CRUD operations
 * Implements soft delete pattern and basic error handling
 */
export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  /**
   * Creates a new entity instance
   * @param data Entity data
   * @returns Created entity
   */
  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.create(data);
    return this.save(entity);
  }

  /**
   * Finds an entity by ID with optional relations
   * @param id Entity ID
   * @param relations Optional relations to load
   * @returns Found entity or throws NotFoundException
   */
  async findByIdOrFail(id: string, relations: string[] = []): Promise<T> {
    const entity = await this.findOne({
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
    await this.update(id, data);
    return this.findByIdOrFail(id);
  }

  /**
   * Soft deletes an entity by ID
   * @param id Entity ID
   * @returns UpdateResult
   */
  async softDeleteEntity(id: string): Promise<UpdateResult> {
    const result = await this.update(id, {
      deleted_at: new Date(),
    } as unknown as QueryDeepPartialEntity<T>);

    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    
    return result;
  }
  
  /**
   * Override the inherited softDelete method to maintain compatibility
   * @param criteria Entity ID or criteria
   * @returns UpdateResult
   */
  softDelete(criteria: string | FindOptionsWhere<T>): Promise<UpdateResult> {
    if (typeof criteria === 'string') {
      return this.softDeleteEntity(criteria);
    }
    
    // Call the parent implementation for other criteria types
    return super.softDelete(criteria);
  }

  /**
   * Restores a soft-deleted entity
   * @param id Entity ID
   * @returns UpdateResult
   */
  async restoreEntity(id: string): Promise<UpdateResult> {
    const result = await this.update(id, {
      deleted_at: null,
    } as unknown as QueryDeepPartialEntity<T>);

    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    
    return result;
  }
  
  /**
   * Override the inherited restore method to maintain compatibility
   * @param criteria Entity ID or criteria
   * @returns UpdateResult
   */
  restore(criteria: string | FindOptionsWhere<T>): Promise<UpdateResult> {
    if (typeof criteria === 'string') {
      return this.restoreEntity(criteria);
    }
    
    // Call the parent implementation for other criteria types
    return super.restore(criteria);
  }
}
