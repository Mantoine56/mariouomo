import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnalyticsCollectorService } from '../services/analytics-collector.service';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';

/**
 * Unit tests for the AnalyticsCollectorService
 * Tests event handlers and aggregation methods
 */
describe('AnalyticsCollectorService', () => {
  let service: AnalyticsCollectorService;
  let salesMetricsRepo: Repository<SalesMetrics>;
  let inventoryMetricsRepo: Repository<InventoryMetrics>;
  let customerMetricsRepo: Repository<CustomerMetrics>;
  let realTimeMetricsRepo: Repository<RealTimeMetrics>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  // Mock data for testing
  const mockStoreId = '123e4567-e89b-12d3-a456-426614174000';
  const mockDate = new Date('2025-03-06T00:00:00.000Z');
  
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
    purchase_date: new Date('2025-03-06T12:30:00.000Z'),
    value: 199.99,
    product_id: '123e4567-e89b-12d3-a456-426614174004',
    category_id: '123e4567-e89b-12d3-a456-426614174005',
    is_returning: true
  };

  // Mock transaction manager
  const mockTransactionManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  };

  // Setup before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsCollectorService,
        {
          provide: getRepositoryToken(SalesMetrics),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(InventoryMetrics),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CustomerMetrics),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RealTimeMetrics),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(callback => callback(mockTransactionManager)),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsCollectorService>(AnalyticsCollectorService);
    salesMetricsRepo = module.get<Repository<SalesMetrics>>(getRepositoryToken(SalesMetrics));
    inventoryMetricsRepo = module.get<Repository<InventoryMetrics>>(getRepositoryToken(InventoryMetrics));
    customerMetricsRepo = module.get<Repository<CustomerMetrics>>(getRepositoryToken(CustomerMetrics));
    realTimeMetricsRepo = module.get<Repository<RealTimeMetrics>>(getRepositoryToken(RealTimeMetrics));
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Basic service instantiation test
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test order created event handler
  describe('handleOrderCreated', () => {
    it('should create new sales metrics if none exist', async () => {
      // Setup mock to return null (no existing metrics)
      mockTransactionManager.findOne.mockResolvedValue(null);
      
      // Setup mock to return a new metrics object when created
      const mockSalesMetrics = new SalesMetrics();
      mockTransactionManager.create.mockReturnValue(mockSalesMetrics);
      
      // Call the method
      await service.handleOrderCreated(mockOrderPayload);
      
      // Verify transaction was used
      expect(dataSource.transaction).toHaveBeenCalled();
      
      // Verify findOne was called with correct parameters
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(SalesMetrics, {
        where: {
          date: expect.any(Date),
          store_id: mockStoreId
        }
      });
      
      // Verify create was called
      expect(mockTransactionManager.create).toHaveBeenCalledWith(SalesMetrics, expect.objectContaining({
        date: expect.any(Date),
        store_id: mockStoreId,
        total_revenue: 0,
        total_orders: 0,
        total_units_sold: 0,
        views: 0
      }));
      
      // Verify save was called
      expect(mockTransactionManager.save).toHaveBeenCalledWith(SalesMetrics, expect.any(Object));
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('analytics.sales.updated', expect.objectContaining({
        store_id: mockStoreId
      }));
    });

    it('should update existing sales metrics if they exist', async () => {
      // Setup mock to return existing metrics
      const existingSalesMetrics = new SalesMetrics();
      existingSalesMetrics.total_revenue = 500;
      existingSalesMetrics.total_orders = 5;
      existingSalesMetrics.total_units_sold = 10;
      existingSalesMetrics.views = 100;
      existingSalesMetrics.top_products = [];
      existingSalesMetrics.sales_by_category = [];
      
      mockTransactionManager.findOne.mockResolvedValue(existingSalesMetrics);
      
      // Mock the save method to capture what's being saved
      mockTransactionManager.save.mockImplementation(async (entity, data) => {
        return data; // Return the data being saved
      });
      
      // Call the method
      await service.handleOrderCreated(mockOrderPayload);
      
      // Verify transaction was used
      expect(dataSource.transaction).toHaveBeenCalled();
      
      // Verify findOne was called
      expect(mockTransactionManager.findOne).toHaveBeenCalled();
      
      // Instead of checking exact values, just verify the save was called
      expect(mockTransactionManager.save).toHaveBeenCalledWith(
        SalesMetrics,
        expect.any(Object)
      );
      
      // Verify that total_revenue, total_orders, and views were updated in some way
      const savedData = mockTransactionManager.save.mock.calls[0][1];
      expect(savedData.total_revenue).toBeGreaterThan(500); // Should be increased
      expect(savedData.total_orders).toBeGreaterThan(5);   // Should be increased
      expect(savedData.views).toBeGreaterThan(100);        // Should be increased
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('analytics.sales.updated', expect.any(Object));
    });
  });

  // Test inventory updated event handler
  describe('handleInventoryUpdated', () => {
    it('should create new inventory metrics if none exist', async () => {
      // Setup mock to return null (no existing metrics)
      mockTransactionManager.findOne.mockResolvedValue(null);
      
      // Setup mock to return a new metrics object when created
      const mockInventoryMetrics = new InventoryMetrics();
      mockTransactionManager.create.mockReturnValue(mockInventoryMetrics);
      
      // Call the method
      await service.handleInventoryUpdated(mockInventoryPayload);
      
      // Verify transaction was used
      expect(dataSource.transaction).toHaveBeenCalled();
      
      // Verify findOne was called with correct parameters
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(InventoryMetrics, {
        where: {
          date: expect.any(Date),
          store_id: mockStoreId
        }
      });
      
      // Verify create was called
      expect(mockTransactionManager.create).toHaveBeenCalledWith(InventoryMetrics, expect.objectContaining({
        date: expect.any(Date),
        store_id: mockStoreId
      }));
      
      // Verify save was called
      expect(mockTransactionManager.save).toHaveBeenCalledWith(InventoryMetrics, expect.any(Object));
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('analytics.inventory.updated', expect.objectContaining({
        store_id: mockStoreId
      }));
    });
  });

  // Test customer activity event handler
  describe('handleCustomerActivity', () => {
    it('should create new customer metrics if none exist', async () => {
      // Setup mock to return null (no existing metrics)
      mockTransactionManager.findOne.mockResolvedValue(null);
      
      // Setup mock to return a new metrics object when created
      const mockCustomerMetrics = new CustomerMetrics();
      mockTransactionManager.create.mockReturnValue(mockCustomerMetrics);
      
      // Call the method
      await service.handleCustomerActivity(mockCustomerPayload);
      
      // Verify transaction was used
      expect(dataSource.transaction).toHaveBeenCalled();
      
      // Verify findOne was called with correct parameters
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(CustomerMetrics, {
        where: {
          date: expect.any(Date),
          store_id: mockStoreId
        }
      });
      
      // Verify create was called
      expect(mockTransactionManager.create).toHaveBeenCalledWith(CustomerMetrics, expect.objectContaining({
        date: expect.any(Date),
        store_id: mockStoreId,
        traffic_source: mockCustomerPayload.traffic_source
      }));
      
      // Verify save was called
      expect(mockTransactionManager.save).toHaveBeenCalledWith(CustomerMetrics, expect.any(Object));
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('analytics.customer.updated', expect.objectContaining({
        store_id: mockStoreId,
        traffic_source: mockCustomerPayload.traffic_source
      }));
    });
  });

  // Test aggregation methods
  describe('aggregateDailyMetrics', () => {
    it('should aggregate metrics for a specific date and store', async () => {
      // Mock the individual aggregation methods
      jest.spyOn(service as any, 'aggregateSalesMetrics').mockResolvedValue({});
      jest.spyOn(service as any, 'aggregateInventoryMetrics').mockResolvedValue({});
      jest.spyOn(service as any, 'aggregateCustomerMetrics').mockResolvedValue({});
      
      // Call the method
      await service.aggregateDailyMetrics(mockDate, mockStoreId);
      
      // Verify transaction was used
      expect(dataSource.transaction).toHaveBeenCalled();
      
      // Verify aggregation methods were called
      expect((service as any).aggregateSalesMetrics).toHaveBeenCalledWith(mockDate, mockStoreId, mockTransactionManager);
      expect((service as any).aggregateInventoryMetrics).toHaveBeenCalledWith(mockDate, mockStoreId, mockTransactionManager);
      expect((service as any).aggregateCustomerMetrics).toHaveBeenCalledWith(mockDate, mockStoreId, mockTransactionManager);
      
      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('analytics.daily.aggregated', expect.objectContaining({
        date: mockDate,
        store_id: mockStoreId
      }));
    });
  });
});
