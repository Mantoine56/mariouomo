import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProductRepository } from '../src/modules/products/repositories/product.repository';
import { Product } from '../src/modules/products/entities/product.entity';
import { PaginationQueryDto, SortDirection } from '../src/common/dtos/pagination.dto';
import { NotFoundException } from '@nestjs/common';
import { SearchProductsDto } from '../src/modules/products/dtos/search-products.dto';
import { ProductVariant } from '../src/modules/products/entities/product-variant.entity';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let variantRepository: Repository<ProductVariant>;
  let entityManager: EntityManager;

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
    getMany: jest.fn().mockResolvedValue([mockProduct]),
    getCount: jest.fn().mockResolvedValue(1),
    getOne: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            getRepository: jest.fn().mockReturnValue({
              createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
              findOne: jest.fn(),
              create: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    variantRepository = module.get<Repository<ProductVariant>>(getRepositoryToken(ProductVariant));
    entityManager = module.get<EntityManager>(EntityManager);
    
    repository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
    repository.findOne = jest.fn().mockResolvedValue(mockProduct);
  });

  describe('searchProducts', () => {
    it('should return paginated products', async () => {
      // Arrange
      const query: PaginationQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortDirection: SortDirection.DESC,
      };

      const searchDto: SearchProductsDto = {
        query: '',
      };

      // Act
      const result = await repository.searchProducts(searchDto, query);

      // Assert
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
      // Arrange
      const query: PaginationQueryDto = {
        page: 1,
        limit: 10,
      };

      const searchDto: SearchProductsDto = {
        query: 'test',
      };

      // Act
      await repository.searchProducts(searchDto, query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('addVariant', () => {
    it('should add a variant to a product', async () => {
      // Arrange
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const variantData = {
        sku: 'TEST-SKU-123',
        price: 150,
        stock: 10,
        attributes: { color: 'red', size: 'M' },
      };
      
      const mockVariant = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...variantData,
        product: mockProduct,
      };
      
      jest.spyOn(variantRepository, 'create').mockReturnValue(mockVariant as any);
      jest.spyOn(variantRepository, 'save').mockResolvedValue(mockVariant as any);
      
      // Act
      const result = await repository.addVariant(productId, variantData);
      
      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
      expect(variantRepository.create).toHaveBeenCalledWith({
        ...variantData,
        product: mockProduct,
      });
      expect(variantRepository.save).toHaveBeenCalledWith(mockVariant);
      expect(result).toEqual(mockVariant);
    });
    
    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const variantData = { sku: 'TEST-SKU-123' };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      
      // Act & Assert
      await expect(repository.addVariant(productId, variantData)).rejects.toThrow(NotFoundException);
    });
  });
}); 