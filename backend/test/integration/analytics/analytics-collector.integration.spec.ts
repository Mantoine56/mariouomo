import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsCollectorService } from '../../../src/modules/analytics/services/analytics-collector.service';
import { SalesMetrics } from '../../../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../../../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../../../src/modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../../../src/modules/analytics/entities/real-time-metrics.entity';
import { getDatabaseConfig } from '../../../src/config/database.config';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Integration tests for the AnalyticsCollectorService
 * Tests service with real database connections
 */
describe('AnalyticsCollectorService Integration', () => {
  let service: AnalyticsCollectorService;
  let salesMetricsRepo: Repository<SalesMetrics>;
  let inventoryMetricsRepo: Repository<InventoryMetrics>;
  let customerMetricsRepo: Repository<CustomerMetrics>;
  let realTimeMetricsRepo: Repository<RealTimeMetrics>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;
  let moduleRef: TestingModule;

  // Mock data for testing
  const mockStoreId = '123e4567-e89b-12d3-a456-426614174000';
  const mockDate = new Date();
  mockDate.setHours(0, 0, 0, 0);
  
  // Mock order payload
  const mockOrderPayload = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    store_id: mockStoreId,
    customer_id: '123e4567-e89b-12d3-a456-426614174002',
    total: 199.99,
    traffic_source: 'google',
    items: [
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        product_id: '123e4567-e89b-12d3-a456-426614174004',
        category_id: '123e4567-e89b-12d3-a456-426614174005',
        quantity: 2,
        price: 89.99,
        discount: 10.00
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174006',
        product_id: '123e4567-e89b-12d3-a456-426614174007',
        category_id: '123e4567-e89b-12d3-a456-426614174008',
        quantity: 1,
        price: 29.99,
        discount: 0
      }
    ],
    views: 25,
    discount_total: 10.00
  };

  // Mock inventory payload
  const mockInventoryPayload = {
    store_id: mockStoreId,
    product_id: '123e4567-e89b-12d3-a456-426614174004',
    category_id: '123e4567-e89b-12d3-a456-426614174005',
    quantity_change: -2,
    current_quantity: 8,
    low_stock_threshold: 10,
    location: 'warehouse-1',
    value_per_unit: 45.00
  };

  // Mock customer activity payload
  const mockCustomerPayload = {
    store_id: mockStoreId,
    customer_id: '123e4567-e89b-12d3-a456-426614174002',
    activity_type: 'purchase' as 'purchase',
    traffic_source: 'google',
    purchase_date: new Date(),
    value: 199.99,
    product_id: '123e4567-e89b-12d3-a456-426614174004',
    category_id: '123e4567-e89b-12d3-a456-426614174005',
    is_returning: true
  };

  // Setup before all tests
  beforeAll(async () => {
    // Create test module with real database connection
    moduleRef = await Test.createTestingModule({
      imports: [
        // Import configuration module
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        // Import TypeORM with real database connection
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...getDatabaseConfig(configService),
            // Override entities to use source files during testing
            entities: [SalesMetrics, InventoryMetrics, CustomerMetrics, RealTimeMetrics],
            // Important: Don't synchronize in production, but for tests it's useful
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        // Import repositories for entities
        TypeOrmModule.forFeature([
          SalesMetrics,
          InventoryMetrics,
          CustomerMetrics,
          RealTimeMetrics,
        ]),
        // Import event emitter module
        EventEmitterModule.forRoot(),
      ],
      providers: [
        AnalyticsCollectorService,
      ],
    }).compile();

    // Get service and repositories
    service = moduleRef.get<AnalyticsCollectorService>(AnalyticsCollectorService);
    salesMetricsRepo = moduleRef.get<Repository<SalesMetrics>>(getRepositoryToken(SalesMetrics));
    inventoryMetricsRepo = moduleRef.get<Repository<InventoryMetrics>>(getRepositoryToken(InventoryMetrics));
    customerMetricsRepo = moduleRef.get<Repository<CustomerMetrics>>(getRepositoryToken(CustomerMetrics));
    realTimeMetricsRepo = moduleRef.get<Repository<RealTimeMetrics>>(getRepositoryToken(RealTimeMetrics));
    dataSource = moduleRef.get<DataSource>(DataSource);
    eventEmitter = moduleRef.get<EventEmitter2>(EventEmitter2);

    // Spy on event emitter
    jest.spyOn(eventEmitter, 'emit').mockImplementation(() => true);
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up database after tests
    await salesMetricsRepo.delete({});
    await inventoryMetricsRepo.delete({});
    await customerMetricsRepo.delete({});
    await realTimeMetricsRepo.delete({});
    
    // Close database connection
    await moduleRef.close();
  });

  // Clean up after each test
  afterEach(async () => {
    // Clean up database after each test
    await salesMetricsRepo.delete({});
    await inventoryMetricsRepo.delete({});
    await customerMetricsRepo.delete({});
    await realTimeMetricsRepo.delete({});
    
    // Reset mocks
    jest.clearAllMocks();
  });

  // Basic service instantiation test
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(salesMetricsRepo).toBeDefined();
    expect(inventoryMetricsRepo).toBeDefined();
    expect(customerMetricsRepo).toBeDefined();
    expect(realTimeMetricsRepo).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  // Test order created event handler with real database
  describe('handleOrderCreated', () => {
    it('should create new sales metrics in the database', async () => {
      // Call the method
      await service.handleOrderCreated(mockOrderPayload);
      
      // Query the database to verify data was saved
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const savedMetrics = await salesMetricsRepo.findOne({
        where: {
          date: today,
          store_id: mockStoreId
        }
      });
      
      // Verify data was saved correctly
      expect(savedMetrics).toBeDefined();
      expect(savedMetrics!.total_revenue).toEqual(199.99);
      expect(savedMetrics!.total_orders).toEqual(1);
      expect(savedMetrics!.total_units_sold).toEqual(3); // 2 + 1 items
      expect(savedMetrics!.views).toEqual(25);
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'analytics.sales.updated',
        expect.objectContaining({
          store_id: mockStoreId
        })
      );
    });

    it('should update existing sales metrics in the database', async () => {
      // Create initial metrics
      const initialMetrics = salesMetricsRepo.create({
        date: mockDate,
        store_id: mockStoreId,
        total_revenue: 500,
        total_orders: 5,
        total_units_sold: 10,
        average_order_value: 100,
        discount_amount: 50,
        conversion_rate: 20,
        views: 100,
        top_products: [],
        sales_by_category: []
      });
      
      await salesMetricsRepo.save(initialMetrics);
      
      // Call the method
      await service.handleOrderCreated(mockOrderPayload);
      
      // Query the database to verify data was updated
      const updatedMetrics = await salesMetricsRepo.findOne({
        where: {
          date: mockDate,
          store_id: mockStoreId
        }
      });
      
      // Verify data was updated correctly
      expect(updatedMetrics).toBeDefined();
      expect(updatedMetrics!.total_revenue).toBeGreaterThan(500); // Should be increased
      expect(updatedMetrics!.total_orders).toEqual(6); // 5 + 1
      expect(updatedMetrics!.total_units_sold).toEqual(13); // 10 + 3
      expect(updatedMetrics!.views).toEqual(125); // 100 + 25
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'analytics.sales.updated',
        expect.objectContaining({
          store_id: mockStoreId
        })
      );
    });
  });

  // Test inventory updated event handler with real database
  describe('handleInventoryUpdated', () => {
    it('should create new inventory metrics in the database', async () => {
      // Call the method
      await service.handleInventoryUpdated(mockInventoryPayload);
      
      // Query the database to verify data was saved
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const savedMetrics = await inventoryMetricsRepo.findOne({
        where: {
          date: today,
          store_id: mockStoreId
        }
      });
      
      // Verify data was saved correctly
      expect(savedMetrics).toBeDefined();
      expect(savedMetrics!.inventory_value).toEqual(-90); // -2 * 45.00
      expect(savedMetrics!.low_stock_items).toEqual(1); // Current quantity is below threshold
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'analytics.inventory.updated',
        expect.objectContaining({
          store_id: mockStoreId
        })
      );
    });
  });

  // Test customer activity event handler with real database
  describe('handleCustomerActivity', () => {
    it('should create new customer metrics in the database', async () => {
      // Call the method
      await service.handleCustomerActivity(mockCustomerPayload);
      
      // Query the database to verify data was saved
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const savedMetrics = await customerMetricsRepo.findOne({
        where: {
          date: today,
          store_id: mockStoreId
        }
      });
      
      // Verify data was saved correctly
      expect(savedMetrics).toBeDefined();
      expect(savedMetrics!.returning_customers).toEqual(1); // Is returning customer
      expect(savedMetrics!.traffic_source).toEqual('google');
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'analytics.customer.updated',
        expect.objectContaining({
          store_id: mockStoreId,
          traffic_source: 'google'
        })
      );
    });
  });

  // Test aggregation methods with real database
  describe('aggregateDailyMetrics', () => {
    it('should aggregate metrics for a specific date and store', async () => {
      // First create some test data
      await service.handleOrderCreated(mockOrderPayload);
      await service.handleInventoryUpdated(mockInventoryPayload);
      await service.handleCustomerActivity(mockCustomerPayload);
      
      // Call the aggregation method
      await service.aggregateDailyMetrics(mockDate, mockStoreId);
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'analytics.daily.aggregated',
        expect.objectContaining({
          date: mockDate,
          store_id: mockStoreId
        })
      );
    });
  });
});
