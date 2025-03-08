import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTestModule } from '../../utils/auth-test.module';
import { TestDatabaseModule } from '../../utils/test-database.module';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../../src/modules/auth/enums/role.enum';

// Import necessary test modules
import { ProductTestModule } from '../../utils/product-test.module';
import { OrderTestModule } from '../../utils/order-test.module';

/**
 * Data Persistence Integration Tests
 * 
 * These tests verify that:
 * 1. Data is properly stored and retrieved across service boundaries
 * 2. Relationships between entities are maintained correctly
 * 3. Updates to data are properly persisted
 * 4. Data integrity is maintained during complex operations
 */
describe('Data Persistence Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  
  // Test admin user
  const adminUser = {
    id: uuidv4(),
    email: 'admin-persistence-test@example.com',
    full_name: 'Admin Persistence Test User',
    role: Role.ADMIN,
  };
  
  // Test data
  let adminToken = '';
  let testStoreId = uuidv4();
  let testProductId = '';
  let testVariantId = '';
  let testOrderId = '';
  
  beforeAll(async () => {
    // Create the testing module with necessary modules
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        AuthTestModule,
        ProductTestModule, // Use the test module that includes cache mocks
        OrderTestModule,   // Use the test module for orders
      ],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();

    // Get necessary services
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Generate admin JWT token
    adminToken = generateToken(adminUser);
  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    // Close the application
    await app.close();
  });

  /**
   * Helper to generate JWT tokens
   */
  function generateToken(userData: { id: string; email: string; full_name: string; role: Role }): string {
    const jwtSecret = configService.get<string>('JWT_SECRET') || 
                     configService.get<string>('SUPABASE_JWT_SECRET') || 
                     'test_jwt_secret_for_integration_tests';
    
    return jwtService.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role,
      },
      {
        secret: jwtSecret,
        expiresIn: '1h',
      }
    );
  }

  /**
   * Test suite for product persistence
   * Verifies that product data is properly stored and can be retrieved
   */
  describe('Product Persistence', () => {
    // Test product data
    const testProduct = {
      name: 'Persistence Test Product',
      description: 'A product to test data persistence',
      base_price: 99.99,
      type: 'physical',
      store_id: testStoreId,
      status: 'active',
      metadata: {
        test_field: 'test_value',
        weight: '1.5kg',
      },
    };

    // Test product variant data
    const testVariant = {
      name: 'Test Variant',
      sku: 'TEST-PERSIST-SKU-001',
      price: 109.99,
      stock_quantity: 100,
      options: {
        color: 'Red',
        size: 'Large',
      },
    };

    it('should create a product and properly persist it', async () => {
      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testProduct);
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(testProduct.name);
      
      // Store the product ID for future tests
      testProductId = createResponse.body.id;
      
      // Retrieve the product to verify persistence
      const getResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('id', testProductId);
      expect(getResponse.body.name).toBe(testProduct.name);
      expect(getResponse.body.base_price).toBe(testProduct.base_price);
      expect(getResponse.body.metadata).toEqual(testProduct.metadata);
    });

    it('should update a product and persist the changes', async () => {
      // Update product data
      const updatedData = {
        name: 'Updated Persistence Test Product',
        description: 'Updated description for testing persistence',
        base_price: 129.99,
      };
      
      // Update the product
      const updateResponse = await request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe(updatedData.name);
      expect(updateResponse.body.base_price).toBe(updatedData.base_price);
      
      // Retrieve the product to verify changes were persisted
      const getResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe(updatedData.name);
      expect(getResponse.body.description).toBe(updatedData.description);
      expect(getResponse.body.base_price).toBe(updatedData.base_price);
      // Original fields should remain unchanged
      expect(getResponse.body.type).toBe(testProduct.type);
      expect(getResponse.body.metadata).toEqual(testProduct.metadata);
    });

    it('should add a variant to a product and correctly establish the relationship', async () => {
      // Add a variant to the product
      const variantResponse = await request(app.getHttpServer())
        .post(`/products/${testProductId}/variants`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testVariant);
      
      expect(variantResponse.status).toBe(201);
      expect(variantResponse.body).toHaveProperty('id');
      expect(variantResponse.body.name).toBe(testVariant.name);
      expect(variantResponse.body.sku).toBe(testVariant.sku);
      
      // Store the variant ID for future tests
      testVariantId = variantResponse.body.id;
      
      // Retrieve the product with variants to verify relationship
      const getResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}?include=variants`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('variants');
      expect(getResponse.body.variants).toBeInstanceOf(Array);
      expect(getResponse.body.variants.length).toBeGreaterThan(0);
      
      // Find our test variant in the variants array
      const foundVariant = getResponse.body.variants.find((v: any) => v.id === testVariantId);
      expect(foundVariant).toBeDefined();
      expect(foundVariant.name).toBe(testVariant.name);
      expect(foundVariant.sku).toBe(testVariant.sku);
      expect(foundVariant.price).toBe(testVariant.price);
    });

    it('should update a product variant and persist the changes', async () => {
      // Update variant data
      const updatedVariantData = {
        name: 'Updated Test Variant',
        sku: 'TEST-PERSIST-SKU-002',
        price: 119.99,
        stock_quantity: 75,
      };
      
      // Update the variant
      const updateResponse = await request(app.getHttpServer())
        .put(`/products/variants/${testVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedVariantData);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe(updatedVariantData.name);
      expect(updateResponse.body.sku).toBe(updatedVariantData.sku);
      expect(updateResponse.body.price).toBe(updatedVariantData.price);
      
      // Retrieve the variant directly to verify changes were persisted
      const getVariantResponse = await request(app.getHttpServer())
        .get(`/products/variants/${testVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getVariantResponse.status).toBe(200);
      expect(getVariantResponse.body.name).toBe(updatedVariantData.name);
      expect(getVariantResponse.body.sku).toBe(updatedVariantData.sku);
      expect(getVariantResponse.body.price).toBe(updatedVariantData.price);
      expect(getVariantResponse.body.stock_quantity).toBe(updatedVariantData.stock_quantity);
      
      // Original options should remain
      expect(getVariantResponse.body.options).toEqual(testVariant.options);
    });
  });

  /**
   * Test suite for order persistence
   * Verifies that order data is properly stored, includes relationships, and can be updated
   */
  describe('Order Persistence', () => {
    // Test order data with proper type for items
    interface OrderItem {
      product_id: string | null;
      variant_id: string | null;
      quantity: number;
      unit_price: number;
    }
    
    const testOrder = {
      store_id: testStoreId,
      customer_id: uuidv4(),
      payment_method: 'credit_card',
      shipping_address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postal_code: '12345',
        country: 'Test Country',
      },
      items: [
        {
          product_id: null, // Will be set dynamically
          variant_id: null, // Will be set dynamically
          quantity: 2,
          unit_price: 119.99,
        } as OrderItem,
      ],
      metadata: {
        source: 'integration_test',
        priority: 'high',
      },
    };

    it('should create an order with product relationships and properly persist it', async () => {
      // Update order data with the product and variant IDs from previous tests
      testOrder.items[0].product_id = testProductId;
      testOrder.items[0].variant_id = testVariantId;
      
      // Create an order
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testOrder);
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.store_id).toBe(testOrder.store_id);
      expect(createResponse.body.customer_id).toBe(testOrder.customer_id);
      
      // Store the order ID for future tests
      testOrderId = createResponse.body.id;
      
      // Retrieve the order to verify persistence
      const getResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('id', testOrderId);
      expect(getResponse.body.store_id).toBe(testOrder.store_id);
      expect(getResponse.body.customer_id).toBe(testOrder.customer_id);
      expect(getResponse.body.payment_method).toBe(testOrder.payment_method);
      expect(getResponse.body.shipping_address).toEqual(testOrder.shipping_address);
      expect(getResponse.body.metadata).toEqual(testOrder.metadata);
      
      // Verify order items
      expect(getResponse.body).toHaveProperty('items');
      expect(getResponse.body.items).toBeInstanceOf(Array);
      expect(getResponse.body.items.length).toBe(1);
      expect(getResponse.body.items[0].product_id).toBe(testProductId);
      expect(getResponse.body.items[0].variant_id).toBe(testVariantId);
      expect(getResponse.body.items[0].quantity).toBe(testOrder.items[0].quantity);
    });

    it('should update an order and persist the changes', async () => {
      // Update order data
      const updatedOrderData = {
        status: 'processing',
        payment_status: 'paid',
        notes: 'Rush order for VIP customer',
      };
      
      // Update the order
      const updateResponse = await request(app.getHttpServer())
        .put(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedOrderData);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe(updatedOrderData.status);
      expect(updateResponse.body.payment_status).toBe(updatedOrderData.payment_status);
      expect(updateResponse.body.notes).toBe(updatedOrderData.notes);
      
      // Retrieve the order to verify changes were persisted
      const getResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.status).toBe(updatedOrderData.status);
      expect(getResponse.body.payment_status).toBe(updatedOrderData.payment_status);
      expect(getResponse.body.notes).toBe(updatedOrderData.notes);
      
      // Original fields should remain unchanged
      expect(getResponse.body.store_id).toBe(testOrder.store_id);
      expect(getResponse.body.customer_id).toBe(testOrder.customer_id);
      expect(getResponse.body.payment_method).toBe(testOrder.payment_method);
    });
  });

  /**
   * Test suite for cross-module relationship persistence
   * Verifies that relationships between different modules are properly maintained
   */
  describe('Cross-Module Relationship Persistence', () => {
    it('should correctly link products to orders and maintain the relationship', async () => {
      // Retrieve the order with detailed product information
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}?include=items.product,items.variant`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.body).toHaveProperty('items');
      expect(getOrderResponse.body.items.length).toBeGreaterThan(0);
      
      // Verify product information is included in the order
      const orderItem = getOrderResponse.body.items[0];
      expect(orderItem).toHaveProperty('product');
      expect(orderItem.product).toHaveProperty('id', testProductId);
      expect(orderItem).toHaveProperty('variant');
      expect(orderItem.variant).toHaveProperty('id', testVariantId);
    });

    it('should retrieve products with order information to verify bi-directional relationships', async () => {
      // Retrieve the product with order information
      const getProductResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}?include=orders`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getProductResponse.status).toBe(200);
      expect(getProductResponse.body).toHaveProperty('orders');
      expect(getProductResponse.body.orders).toBeInstanceOf(Array);
      
      // Find our test order in the orders array
      const foundOrder = getProductResponse.body.orders.find((o: any) => o.id === testOrderId);
      expect(foundOrder).toBeDefined();
    });
  });

  /**
   * Test suite for data integrity
   * Verifies that data integrity is maintained during complex operations
   */
  describe('Data Integrity', () => {
    it('should maintain data integrity when deleting a product variant', async () => {
      // Delete the variant
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/products/variants/${testVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(deleteResponse.status).toBe(204);
      
      // Try to retrieve the variant - should return 404
      const getVariantResponse = await request(app.getHttpServer())
        .get(`/products/variants/${testVariantId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getVariantResponse.status).toBe(404);
      
      // Retrieve the order to ensure it still exists even after variant deletion
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.body).toHaveProperty('id', testOrderId);
      
      // Order items should still contain the deleted variant reference
      // This is expected behavior as orders represent historical data
      expect(getOrderResponse.body.items[0].variant_id).toBe(testVariantId);
    });

    it('should maintain data integrity when deleting a product', async () => {
      // Delete the product
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(deleteResponse.status).toBe(204);
      
      // Try to retrieve the product - should return 404
      const getProductResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getProductResponse.status).toBe(404);
      
      // Retrieve the order to ensure it still exists even after product deletion
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.body).toHaveProperty('id', testOrderId);
      
      // Order items should still contain the deleted product reference
      // This is expected behavior as orders represent historical data
      expect(getOrderResponse.body.items[0].product_id).toBe(testProductId);
    });
  });
}); 