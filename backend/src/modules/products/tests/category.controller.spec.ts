import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, MoveCategoryDto } from '../dtos/category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test Description',
    path: 'Test Path',
    totalProducts: 0,
    position: 1,
    isVisible: true,
    children: [],
    parent: {} as Category,
    products: [],
    childCount: 0,
    imageUrl: undefined,
    seoMetadata: undefined,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            moveCategory: jest.fn(),
            getCategoryTree: jest.fn(),
            getCategoryById: jest.fn(),
            getCategoryBySlug: jest.fn(),
            updateCategoryProductCounts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  describe('createCategory', () => {
    const createDto: CreateCategoryDto = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test Description',
    };

    it('should create a category', async () => {
      service.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createDto);

      expect(result).toEqual(mockCategory);
      expect(service.createCategory).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateCategory', () => {
    const updateDto: UpdateCategoryDto = {
      name: 'Updated Category',
      description: 'Updated Description',
      slug: 'updated-category',
    };

    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, ...updateDto };
      service.updateCategory.mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory('1', updateDto);

      expect(result).toEqual(updatedCategory);
      expect(service.updateCategory).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      service.deleteCategory.mockResolvedValue(undefined);

      await controller.deleteCategory('1');

      expect(service.deleteCategory).toHaveBeenCalledWith('1');
    });
  });

  describe('moveCategory', () => {
    const moveDto: MoveCategoryDto = {
      parentId: '2',
      position: 1,
    };

    it('should move a category', async () => {
      const movedCategory = { ...mockCategory, parent: { id: '2' } as Category };
      service.moveCategory.mockResolvedValue(movedCategory);

      const result = await controller.moveCategory('1', moveDto);

      expect(result).toEqual(movedCategory);
      expect(service.moveCategory).toHaveBeenCalledWith('1', moveDto);
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree', async () => {
      const tree = [mockCategory];
      service.getCategoryTree.mockResolvedValue(tree);

      const result = await controller.getCategoryTree();

      expect(result).toEqual(tree);
      expect(service.getCategoryTree).toHaveBeenCalled();
    });
  });

  describe('getCategory', () => {
    it('should return a category by id', async () => {
      service.getCategoryById.mockResolvedValue(mockCategory);

      const result = await controller.getCategory('1');

      expect(result).toEqual(mockCategory);
      expect(service.getCategoryById).toHaveBeenCalledWith('1');
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return a category by slug', async () => {
      service.getCategoryBySlug.mockResolvedValue(mockCategory);

      const result = await controller.getCategoryBySlug('test-category');

      expect(result).toEqual(mockCategory);
      expect(service.getCategoryBySlug).toHaveBeenCalledWith('test-category');
    });
  });

  describe('updateCategoryProductCounts', () => {
    it('should update category product counts', async () => {
      service.updateCategoryProductCounts.mockResolvedValue(undefined);

      await controller.updateCategoryProductCounts();

      expect(service.updateCategoryProductCounts).toHaveBeenCalled();
    });
  });
});
