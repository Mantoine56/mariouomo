import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../src/modules/products/entities/product.entity';
import { ProductVariant } from '../../src/modules/products/entities/product-variant.entity';
import { ProductImage } from '../../src/modules/products/entities/product-image.entity';
import { InventoryItem } from '../../src/modules/inventory/entities/inventory-item.entity';
import { Store } from '../../src/modules/stores/entities/store.entity';
import { Category } from '../../src/modules/products/entities/category.entity';
import { TestDatabaseModule } from './test-database.module';

// Mock cache service
const MockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
};

// Mock product repository
const MockProductRepository = {
  createProduct: jest.fn().mockImplementation(async (createProductDto) => {
    const product = new Product();
    Object.assign(product, createProductDto);
    product.id = 'test-product-id';
    return product;
  }),
  updateProduct: jest.fn().mockImplementation(async (id, updateProductDto) => {
    const product = new Product();
    Object.assign(product, updateProductDto);
    product.id = id;
    return product;
  }),
  getProductById: jest.fn().mockImplementation(async (id) => {
    const product = new Product();
    product.id = id;
    product.name = 'Test Product';
    product.base_price = 99.99;
    return product;
  }),
  findOne: jest.fn().mockImplementation(async (options) => {
    const product = new Product();
    product.id = options.where?.id || 'test-product-id';
    product.name = 'Test Product';
    product.base_price = 99.99;
    return product;
  }),
  create: jest.fn().mockImplementation((data) => {
    const product = new Product();
    Object.assign(product, data);
    product.id = product.id || 'test-product-id';
    return product;
  }),
  save: jest.fn().mockImplementation(async (product) => {
    return product;
  }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

// Mock inventory item repository
const MockInventoryItemRepository = {
  create: jest.fn().mockImplementation((data) => {
    const item = new InventoryItem();
    Object.assign(item, data);
    item.id = 'test-inventory-id';
    return item;
  }),
  save: jest.fn().mockImplementation(async (item) => {
    return Array.isArray(item) ? item : [item];
  }),
  findOne: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

// Mock store repository
const MockStoreRepository = {
  create: jest.fn().mockImplementation((data) => {
    const store = new Store();
    Object.assign(store, data);
    store.id = 'test-store-id';
    return store;
  }),
  save: jest.fn().mockImplementation(async (store) => {
    return store;
  }),
  findOne: jest.fn().mockImplementation(async (options) => {
    const store = new Store();
    store.id = options.where?.id || 'test-store-id';
    store.name = 'Test Store';
    return store;
  }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

// Mock category repository
const MockCategoryRepository = {
  create: jest.fn().mockImplementation((data) => {
    const category = new Category();
    Object.assign(category, data);
    category.id = 'test-category-id';
    return category;
  }),
  save: jest.fn().mockImplementation(async (category) => {
    return category;
  }),
  findOne: jest.fn().mockImplementation(async (options) => {
    const category = new Category();
    category.id = options.where?.id || 'test-category-id';
    category.name = 'Test Category';
    return category;
  }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

/**
 * Test module for Products
 * Provides mocked services and repositories for testing products functionality
 */
@Module({
  imports: [
    TestDatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage, InventoryItem, Store, Category]),
  ],
  providers: [
    {
      provide: 'CacheService',
      useValue: MockCacheService,
    },
    {
      provide: 'ProductRepository',
      useValue: MockProductRepository,
    },
    {
      provide: getRepositoryToken(Product),
      useValue: MockProductRepository,
    },
    {
      provide: getRepositoryToken(ProductVariant),
      useValue: {
        create: jest.fn().mockImplementation((data) => {
          const variant = new ProductVariant();
          Object.assign(variant, data);
          variant.id = 'test-variant-id';
          return variant;
        }),
        save: jest.fn().mockImplementation(async (variant) => {
          return Array.isArray(variant) ? variant : [variant];
        }),
        findOne: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      },
    },
    {
      provide: getRepositoryToken(ProductImage),
      useValue: {
        create: jest.fn().mockImplementation((data) => {
          const image = new ProductImage();
          Object.assign(image, data);
          image.id = 'test-image-id';
          return image;
        }),
        save: jest.fn().mockImplementation(async (image) => {
          return image;
        }),
        findOne: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      },
    },
    {
      provide: getRepositoryToken(InventoryItem),
      useValue: MockInventoryItemRepository,
    },
    {
      provide: getRepositoryToken(Store),
      useValue: MockStoreRepository,
    },
    {
      provide: getRepositoryToken(Category),
      useValue: MockCategoryRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class ProductTestModule {} 