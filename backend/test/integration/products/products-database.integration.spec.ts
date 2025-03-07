import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../src/modules/products/entities/product.entity';
import { ProductStatus } from '../../../src/modules/products/dtos/create-product.dto';
import { Store } from '../../../src/modules/stores/entities/store.entity';
import { ProductTestModule } from '../../utils/product-test.module';

/**
 * Integration tests for Products with mocked dependencies
 * Tests basic CRUD operations using mocked repositories
 */
describe('Products Database Integration Tests', () => {
  let productRepository: Repository<Product>;
  let storeRepository: Repository<Store>;
  let testStoreId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProductTestModule],
    }).compile();
    
    productRepository = moduleRef.get<Repository<Product>>(getRepositoryToken(Product));
    storeRepository = moduleRef.get<Repository<Store>>(getRepositoryToken(Store));
    
    // Create a test store first
    const store = storeRepository.create({
      name: 'Test Store',
      description: 'Test store for integration tests',
      status: 'active'
    });
    
    const savedStore = await storeRepository.save(store);
    testStoreId = savedStore.id;
  }, 30000);
  
  /**
   * Helper function to get test product data
   */
  const getTestProductData = () => {
    return {
      name: 'Test Product',
      description: 'This is a test product',
      base_price: 99.99,
      type: 'physical',
      status: ProductStatus.ACTIVE,
      store_id: testStoreId,
    };
  };
  
  /**
   * Helper function to find a product by ID
   */
  const findProductById = async (id: string): Promise<Product | null> => {
    return productRepository.findOne({ where: { id } });
  };
  
  it('should create a product in the database', async () => {
    // Arrange - Get test product data
    const productData = getTestProductData();
    
    // Act - Create a product using the repository directly
    const product = productRepository.create(productData);
    const savedProduct = await productRepository.save(product);
    
    // Assert - Verify the product was created with the correct data
    expect(savedProduct).toBeDefined();
    expect(savedProduct.id).toBeDefined();
    expect(savedProduct.name).toBe(productData.name);
    expect(savedProduct.base_price).toBe(productData.base_price);
    expect(savedProduct.store_id).toBe(testStoreId);
  });
  
  it('should update a product in the database', async () => {
    // Arrange - Create a product first
    const productData = getTestProductData();
    const product = productRepository.create(productData);
    const savedProduct = await productRepository.save(product);
    
    // Act - Update the product
    const updatedPrice = 149.99;
    savedProduct.base_price = updatedPrice;
    const updatedProduct = await productRepository.save(savedProduct);
    
    // Assert - Verify the product was updated with the new price
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.base_price).toBe(updatedPrice);
  });
  
  it('should delete a product from the database', async () => {
    // Arrange - Create a product first
    const productData = getTestProductData();
    const product = productRepository.create(productData);
    const savedProduct = await productRepository.save(product);
    
    // Act - Delete the product
    const deleteResult = await productRepository.delete(savedProduct.id);
    
    // Assert - Verify the product was deleted
    expect(deleteResult).toBeDefined();
    expect(deleteResult.affected).toBe(1);
    
    // Verify the product is no longer in the database
    const foundProduct = await findProductById(savedProduct.id);
    expect(foundProduct).toBeNull();
  });
}); 