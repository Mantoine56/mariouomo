import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsSchedulerService } from '../../../src/modules/analytics/services/analytics-scheduler.service';
import { AnalyticsCollectorService } from '../../../src/modules/analytics/services/analytics-collector.service';
import { Store } from '../../../src/modules/stores/entities/store.entity';
import { SalesMetrics } from '../../../src/modules/analytics/entities/sales-metrics.entity';
import { InventoryMetrics } from '../../../src/modules/analytics/entities/inventory-metrics.entity';
import { CustomerMetrics } from '../../../src/modules/analytics/entities/customer-metrics.entity';
import { RealTimeMetrics } from '../../../src/modules/analytics/entities/real-time-metrics.entity';
import { getDatabaseConfig } from '../../../src/config/database.config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Integration tests for the AnalyticsSchedulerService
 * Tests scheduled jobs with real database connections
 */
describe('AnalyticsSchedulerService Integration', () => {
  let service: AnalyticsSchedulerService;
  let analyticsCollectorService: AnalyticsCollectorService;
  let storeRepository: Repository<Store>;
  let salesMetricsRepo: Repository<SalesMetrics>;
  let inventoryMetricsRepo: Repository<InventoryMetrics>;
  let customerMetricsRepo: Repository<CustomerMetrics>;
  let moduleRef: TestingModule;

  // Test store data
  const testStores = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Store 1',
      description: 'Integration test store 1',
      status: 'active',
      settings: { theme: 'default' },
      metadata: { region: 'US-East' },
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Store 2',
      description: 'Integration test store 2',
      status: 'active',
      settings: { theme: 'dark' },
      metadata: { region: 'US-West' },
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Inactive Store',
      description: 'This store should be skipped',
      status: 'inactive',
      settings: { theme: 'light' },
      metadata: { region: 'EU' },
    }
  ];

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
            entities: [Store, SalesMetrics, InventoryMetrics, CustomerMetrics, RealTimeMetrics],
            // Important: Don't synchronize in production, but for tests it's useful
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        // Import repositories for entities
        TypeOrmModule.forFeature([
          Store,
          SalesMetrics,
          InventoryMetrics,
          CustomerMetrics,
          RealTimeMetrics,
        ]),
        // Import event emitter module
        EventEmitterModule.forRoot(),
      ],
      providers: [
        AnalyticsSchedulerService,
        AnalyticsCollectorService,
      ],
    }).compile();

    // Get service and repositories
    service = moduleRef.get<AnalyticsSchedulerService>(AnalyticsSchedulerService);
    analyticsCollectorService = moduleRef.get<AnalyticsCollectorService>(AnalyticsCollectorService);
    storeRepository = moduleRef.get<Repository<Store>>(getRepositoryToken(Store));
    salesMetricsRepo = moduleRef.get<Repository<SalesMetrics>>(getRepositoryToken(SalesMetrics));
    inventoryMetricsRepo = moduleRef.get<Repository<InventoryMetrics>>(getRepositoryToken(InventoryMetrics));
    customerMetricsRepo = moduleRef.get<Repository<CustomerMetrics>>(getRepositoryToken(CustomerMetrics));

    // Create test stores in the database
    await seedTestStores();
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up database after tests
    await cleanupTestData();
    
    // Close database connection
    await moduleRef.close();
  });

  // Helper function to seed test stores
  async function seedTestStores() {
    // Clear existing stores first
    await storeRepository.delete({});
    
    // Create test stores
    for (const storeData of testStores) {
      const store = storeRepository.create(storeData);
      await storeRepository.save(store);
    }
  }

  // Helper function to clean up test data
  async function cleanupTestData() {
    await salesMetricsRepo.delete({});
    await inventoryMetricsRepo.delete({});
    await customerMetricsRepo.delete({});
    await storeRepository.delete({});
  }

  // Basic service instantiation test
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(analyticsCollectorService).toBeDefined();
    expect(storeRepository).toBeDefined();
  });

  // Test that stores were properly seeded
  it('should have seeded test stores', async () => {
    const stores = await storeRepository.find();
    expect(stores.length).toEqual(3);
    
    const activeStores = await storeRepository.find({ where: { status: 'active' } });
    expect(activeStores.length).toEqual(2);
  });

  // Test daily aggregation job with real database
  describe('handleDailyAggregation', () => {
    // Spy on the analyticsCollectorService
    let aggregateSpy: jest.SpyInstance;
    
    beforeEach(() => {
      // Create a spy on the aggregateDailyMetrics method
      aggregateSpy = jest.spyOn(analyticsCollectorService, 'aggregateDailyMetrics');
    });
    
    afterEach(() => {
      // Restore the original implementation
      aggregateSpy.mockRestore();
    });
    
    it('should only process active stores', async () => {
      // Call the method
      await service.handleDailyAggregation();
      
      // Verify aggregateDailyMetrics was called for each active store
      expect(aggregateSpy).toHaveBeenCalledTimes(2);
      
      // Get the store IDs that were passed to aggregateDailyMetrics
      const processedStoreIds = aggregateSpy.mock.calls.map(call => call[1]);
      
      // Verify only active stores were processed
      expect(processedStoreIds).toContain(testStores[0].id);
      expect(processedStoreIds).toContain(testStores[1].id);
      expect(processedStoreIds).not.toContain(testStores[2].id);
    });
    
    it('should handle errors for individual stores without failing the entire job', async () => {
      // Make the first call fail but allow others to succeed
      aggregateSpy.mockImplementation((date, storeId) => {
        if (storeId === testStores[0].id) {
          return Promise.reject(new Error('Test error for first store'));
        }
        return Promise.resolve({});
      });
      
      // Call the method
      await service.handleDailyAggregation();
      
      // Verify the method was still called for all active stores
      expect(aggregateSpy).toHaveBeenCalledTimes(2);
      
      // Verify the job didn't crash despite the error
      expect(service).toBeDefined();
    });
  });

  // Test weekly aggregation job with real database
  describe('handleWeeklyAggregation', () => {
    it('should query only active stores', async () => {
      // Spy on the store repository
      const findSpy = jest.spyOn(storeRepository, 'find');
      
      // Call the method
      await service.handleWeeklyAggregation();
      
      // Verify store repository was queried with correct parameters
      expect(findSpy).toHaveBeenCalledWith({
        where: { status: 'active' }
      });
      
      // Verify the correct number of stores were found
      const activeStores = await storeRepository.find({ where: { status: 'active' } });
      expect(activeStores.length).toEqual(2);
    });
  });

  // Test monthly aggregation job with real database
  describe('handleMonthlyAggregation', () => {
    it('should query only active stores', async () => {
      // Spy on the store repository
      const findSpy = jest.spyOn(storeRepository, 'find');
      
      // Call the method
      await service.handleMonthlyAggregation();
      
      // Verify store repository was queried with correct parameters
      expect(findSpy).toHaveBeenCalledWith({
        where: { status: 'active' }
      });
      
      // Verify the correct number of stores were found
      const activeStores = await storeRepository.find({ where: { status: 'active' } });
      expect(activeStores.length).toEqual(2);
    });
  });

  // Test missed aggregations recovery job
  describe('handleMissedAggregations', () => {
    it('should complete without errors', async () => {
      // This is more of a smoke test since the actual implementation is a placeholder
      await expect(service.handleMissedAggregations()).resolves.not.toThrow();
    });
  });
});
