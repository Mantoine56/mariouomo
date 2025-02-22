import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../src/modules/products/repositories/product.repository';
import { Product } from '../src/modules/products/entities/product.entity';
import { PaginationQueryDto, SortDirection } from '../src/common/dtos/pagination.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'Test Description',
    base_price: 100,
    store_id: '123e4567-e89b-12d3-a456-426614174001',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    repository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
  });

  describe('findProducts', () => {
    it('should return paginated products', async () => {
      const query: PaginationQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortDirection: SortDirection.DESC,
      };

      const result = await repository.findProducts(query);

      expect(result).toEqual({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'product.variants',
        'variants',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deleted_at IS NULL',
      );
    });

    it('should apply search filter when search query is provided', async () => {
      const query: PaginationQueryDto = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      await repository.findProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: '%test%' },
      );
    });
  });

  describe('findByStoreId', () => {
    it('should return paginated products for a store', async () => {
      const storeId = '123e4567-e89b-12d3-a456-426614174001';
      const query: PaginationQueryDto = {
        page: 1,
        limit: 10,
      };

      const result = await repository.findByStoreId(storeId, query);

      expect(result).toEqual({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.store_id = :storeId',
        { storeId },
      );
    });
  });
});
