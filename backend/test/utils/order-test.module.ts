import { Module, Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDatabaseModule } from './test-database.module';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { OrderItem } from '../../src/modules/orders/entities/order-item.entity';
import { OrderService } from '../../src/modules/orders/services/order.service';
import { OrderController } from '../../src/modules/orders/controllers/order.controller';
import { ProductTestModule } from './product-test.module';
import { Profile } from '../../src/modules/users/entities/profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Mock Cache Service for testing
 * Mocks the cache service functionality without requiring Redis
 */
@Injectable()
export class MockCacheService {
  private cache: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
    return Promise.resolve();
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    return Promise.resolve();
  }

  async delPattern(pattern: string): Promise<void> {
    // Simple implementation - in a real app we'd use regex
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
    return Promise.resolve();
  }

  async reset(): Promise<void> {
    this.cache.clear();
    return Promise.resolve();
  }
}

/**
 * Mock Profile Repository for testing
 */
@Injectable()
export class MockProfileRepository {
  private profiles: Partial<Profile>[] = [];

  async findOne(conditions: any): Promise<Partial<Profile> | undefined> {
    if (conditions.where && conditions.where.id) {
      return this.profiles.find(profile => profile.id === conditions.where.id);
    }
    
    if (conditions.where && conditions.where.email) {
      return this.profiles.find(profile => profile.email === conditions.where.email);
    }
    
    return undefined;
  }

  async save(profile: Partial<Profile>): Promise<Partial<Profile>> {
    const existingProfileIndex = this.profiles.findIndex(p => p.id === profile.id);
    
    if (existingProfileIndex >= 0) {
      this.profiles[existingProfileIndex] = { ...this.profiles[existingProfileIndex], ...profile };
      return this.profiles[existingProfileIndex];
    } else {
      this.profiles.push(profile);
      return profile;
    }
  }

  async find(conditions?: any): Promise<Partial<Profile>[]> {
    return this.profiles;
  }
}

/**
 * Mock Order Repository for testing
 */
@Injectable()
export class OrderRepository {
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];

  async findOne(conditions: any): Promise<Order | undefined> {
    if (conditions.where && conditions.where.id) {
      const order = this.orders.find(o => o.id === conditions.where.id);
      if (order) {
        order.items = this.orderItems.filter(item => item.order_id === order.id);
      }
      return order;
    }
    return undefined;
  }

  async find(conditions?: any): Promise<Order[]> {
    let orders = [...this.orders];
    
    if (conditions && conditions.where) {
      if (conditions.where.customer_id) {
        orders = orders.filter(o => (o as any).customer_id === conditions.where.customer_id);
      }
      if (conditions.where.store_id) {
        orders = orders.filter(o => o.store_id === conditions.where.store_id);
      }
      if (conditions.where.status) {
        orders = orders.filter(o => o.status === conditions.where.status);
      }
    }
    
    // Add items to orders
    for (const order of orders) {
      order.items = this.orderItems.filter(item => item.order_id === order.id);
    }
    
    return orders;
  }

  async save(order: Partial<Order>): Promise<Order> {
    // Check if order exists
    const existingOrderIndex = this.orders.findIndex(o => o.id === order.id);
    
    if (existingOrderIndex >= 0) {
      // Update existing order
      this.orders[existingOrderIndex] = { ...this.orders[existingOrderIndex], ...order } as Order;
      
      // Save order items if provided
      if (order.items) {
        for (const item of order.items) {
          this.saveOrderItem(item, this.orders[existingOrderIndex].id);
        }
      }
      
      return this.orders[existingOrderIndex];
    } else {
      // Create new order
      const newOrder = {
        ...order,
        id: order.id || `order-${this.orders.length + 1}`,
        created_at: order.created_at || new Date(),
        updated_at: new Date(),
      } as Order;
      
      this.orders.push(newOrder);
      
      // Save order items if provided
      if (order.items) {
        for (const item of order.items) {
          this.saveOrderItem(item, newOrder.id);
        }
      }
      
      return newOrder;
    }
  }

  async saveOrderItem(item: Partial<OrderItem>, orderId: string): Promise<OrderItem> {
    const existingItemIndex = this.orderItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      this.orderItems[existingItemIndex] = { ...this.orderItems[existingItemIndex], ...item } as OrderItem;
      return this.orderItems[existingItemIndex];
    } else {
      // Create new item
      const newItem = {
        ...item,
        id: item.id || `item-${this.orderItems.length + 1}`,
        order_id: orderId,
        created_at: item.created_at || new Date(),
        updated_at: new Date(),
      } as OrderItem;
      
      this.orderItems.push(newItem);
      return newItem;
    }
  }

  async delete(id: string): Promise<void> {
    // Delete order items first
    this.orderItems = this.orderItems.filter(item => item.order_id !== id);
    
    // Delete order
    this.orders = this.orders.filter(order => order.id !== id);
    return Promise.resolve();
  }

  // Additional methods that might be required by the OrderService
  async findOrderWithItems(id: string): Promise<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      order.items = this.orderItems.filter(item => item.order_id === id);
    }
    return order;
  }

  async findOrdersByCustomer(customerId: string): Promise<Order[]> {
    const orders = this.orders.filter(o => (o as any).customer_id === customerId);
    
    // Add items to orders
    for (const order of orders) {
      order.items = this.orderItems.filter(item => item.order_id === order.id);
    }
    
    return orders;
  }
}

// Mock for OrderItemRepository
@Injectable()
export class OrderItemRepository {
  async findOne(conditions: any): Promise<OrderItem | undefined> {
    return undefined;
  }
  
  async find(conditions?: any): Promise<OrderItem[]> {
    return [];
  }
  
  async save(item: Partial<OrderItem>): Promise<OrderItem> {
    return item as OrderItem;
  }
  
  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

// Mock for ProductVariantRepository
@Injectable()
export class ProductVariantRepository {
  async findOne(conditions: any): Promise<any | undefined> {
    return undefined;
  }
  
  async find(conditions?: any): Promise<any[]> {
    return [];
  }
  
  async save(variant: any): Promise<any> {
    return variant;
  }
  
  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

// Mock for InventoryItemRepository
@Injectable()
export class InventoryItemRepository {
  async findOne(conditions: any): Promise<any | undefined> {
    return undefined;
  }
  
  async find(conditions?: any): Promise<any[]> {
    return [];
  }
  
  async save(item: any): Promise<any> {
    return item;
  }
  
  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

// Mock for ProductRepository
@Injectable()
export class ProductRepository {
  async findOne(conditions: any): Promise<any | undefined> {
    return undefined;
  }
  
  async find(conditions?: any): Promise<any[]> {
    return [];
  }
  
  async save(product: any): Promise<any> {
    return product;
  }
  
  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Test module for Orders
 * Provides mock implementations for testing order functionality
 */
@Module({
  imports: [
    TestDatabaseModule,
    ConfigModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductTestModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: OrderRepository,
      useClass: OrderRepository,
    },
    {
      provide: OrderItemRepository,
      useClass: OrderItemRepository,
    },
    {
      provide: ProductVariantRepository,
      useClass: ProductVariantRepository,
    },
    {
      provide: getRepositoryToken(Profile),
      useClass: MockProfileRepository,
    },
    {
      provide: 'InventoryItemRepository',
      useClass: InventoryItemRepository,
    },
    {
      provide: 'ProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'CACHE_SERVICE',
      useClass: MockCacheService,
    },
    {
      provide: 'DataSource',
      useValue: {
        createQueryRunner: () => ({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
          manager: {
            save: jest.fn().mockImplementation((entity) => entity),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        }),
      },
    },
  ],
  exports: [OrderService, OrderRepository],
})
export class OrderTestModule {}