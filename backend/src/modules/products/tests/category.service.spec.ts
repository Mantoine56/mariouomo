import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreeRepository, DeleteResult } from 'typeorm';
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';
import { CacheService } from '../../../common/cache/cache.service';
import { CreateCategoryDto, UpdateCategoryDto, MoveCategoryDto } from '../dtos/category.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<TreeRepository<Category>>;
  let cacheService: jest.Mocked<CacheService>;

  const mockParent: Partial<Category> = {
    id: '2',
    name: 'Parent Category',
    slug: 'parent-category',
    description: 'Parent Description',
    path: 'Parent Path',
    totalProducts: 0,
    position: 0,
    isVisible: true,
    children: [],
    parent: undefined,
    products: [],
    childCount: 0,
    imageUrl: undefined,
    seoMetadata: undefined,
    created_at: new Date('2025-02-22T17:48:15.881Z'),
    updated_at: new Date('2025-02-22T17:48:15.881Z'),
    deleted_at: undefined
  };

  const mockCategory: Partial<Category> = {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test Description',
    path: 'Test Path',
    totalProducts: 0,
    position: 1,
    isVisible: true,
    children: [],
    parent: undefined,
    products: [],
    childCount: 0,
    imageUrl: undefined,
    seoMetadata: undefined,
    created_at: new Date('2025-02-22T17:48:15.881Z'),
    updated_at: new Date('2025-02-22T17:48:15.881Z'),
    deleted_at: undefined
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            findTrees: jest.fn(),
            findDescendants: jest.fn(),
            findAncestors: jest.fn(),
            findRoots: jest.fn(),
            countDescendants: jest.fn(),
            createDescendantsQueryBuilder: jest.fn()
          }
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(getRepositoryToken(Category));
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const dto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        parentId: '2'
      };

      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockReturnValueOnce(mockCategory as Category);
      repository.save.mockResolvedValueOnce(mockCategory as Category);

      const result = await service.createCategory(dto);
      expect(result).toEqual(mockCategory);
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const dto: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        parentId: '2'
      };

      repository.findOne.mockResolvedValueOnce(mockCategory as Category);

      await expect(service.createCategory(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
        slug: 'updated-category',
        description: 'Updated Description'
      };

      const updatedCategory = { ...mockCategory, ...dto };
      repository.findOne.mockResolvedValueOnce(mockCategory as Category);
      repository.findOne.mockResolvedValueOnce(null); // No duplicate slug
      repository.save.mockResolvedValueOnce(updatedCategory as Category);

      const result = await service.updateCategory('1', dto);
      expect(result).toEqual(updatedCategory);
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
        slug: 'updated-category'
      };

      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateCategory('1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCategoryTree', () => {
    it('should return cached tree if available', async () => {
      const cachedTree = [mockCategory];
      cacheService.get.mockResolvedValueOnce(JSON.stringify(cachedTree));

      const result = await service.getCategoryTree();

      expect(result).toEqual(cachedTree);
      expect(repository.findTrees).not.toHaveBeenCalled();
    });

    it('should fetch and cache tree if not cached', async () => {
      const tree = [mockCategory];
      cacheService.get.mockResolvedValueOnce(null);
      repository.findTrees.mockResolvedValueOnce(tree as Category[]);

      const result = await service.getCategoryTree();

      expect(result).toEqual(tree);
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(tree),
        expect.any(Number)
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      repository.findOne.mockResolvedValueOnce(mockCategory as Category);
      repository.delete.mockResolvedValueOnce({ affected: 1, raw: {} } as DeleteResult);

      await service.deleteCategory('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteCategory('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveCategory', () => {
    it('should move a category successfully', async () => {
      const dto: MoveCategoryDto = {
        parentId: '2',
        position: 1
      };

      repository.findOne.mockResolvedValueOnce(mockCategory as Category);
      repository.findOne.mockResolvedValueOnce(mockParent as Category);
      repository.save.mockResolvedValueOnce({ ...mockCategory, parent: mockParent } as Category);

      const result = await service.moveCategory('1', dto);
      expect(result).toEqual({ ...mockCategory, parent: mockParent });
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      const dto: MoveCategoryDto = {
        parentId: '2',
        position: 1
      };

      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.moveCategory('1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parent category not found', async () => {
      const dto: MoveCategoryDto = {
        parentId: '2',
        position: 1
      };

      repository.findOne.mockResolvedValueOnce(mockCategory as Category);
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.moveCategory('1', dto)).rejects.toThrow(NotFoundException);
    });
  });
});
