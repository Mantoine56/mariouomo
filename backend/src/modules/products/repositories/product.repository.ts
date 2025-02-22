import { EntityRepository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Product } from '../entities/product.entity';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { Injectable } from '@nestjs/common';

/**
 * Repository for Product entity
 * Extends BaseRepository to inherit common CRUD operations
 */
@Injectable()
@EntityRepository(Product)
export class ProductRepository extends BaseRepository<Product> {
  /**
   * Finds products with pagination and filtering
   * @param query Pagination and filter parameters
   * @returns Paginated products with total count
   */
  async findProducts(query: PaginationQueryDto) {
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.deleted_at IS NULL');

    // Apply search if provided
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Apply sorting
    if (query.sortBy) {
      qb.orderBy(`product.${query.sortBy}`, query.sortDirection);
    } else {
      qb.orderBy('product.created_at', 'DESC');
    }

    // Apply pagination
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      hasNextPage: query.page * query.limit < total,
      hasPreviousPage: query.page > 1,
    };
  }

  /**
   * Finds products by store ID
   * @param storeId Store ID
   * @param query Pagination parameters
   * @returns Paginated products for the store
   */
  async findByStoreId(storeId: string, query: PaginationQueryDto) {
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.store_id = :storeId', { storeId })
      .andWhere('product.deleted_at IS NULL');

    // Apply search if provided
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Apply sorting
    if (query.sortBy) {
      qb.orderBy(`product.${query.sortBy}`, query.sortDirection);
    } else {
      qb.orderBy('product.created_at', 'DESC');
    }

    // Apply pagination
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      hasNextPage: query.page * query.limit < total,
      hasPreviousPage: query.page > 1,
    };
  }
}
