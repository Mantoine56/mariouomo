import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner, Driver } from 'typeorm';
import { DatabaseService } from './database.service';
import * as newrelic from 'newrelic';

// Mock NewRelic
jest.mock('newrelic', () => ({
  noticeError: jest.fn(),
  recordMetric: jest.fn(),
  incrementMetric: jest.fn(),
}));

// Define pool interface
interface MockPool {
  totalCount: number;
  activeCount: number;
  on: jest.Mock;
  drain: jest.Mock;
  clear: jest.Mock;
}

// Define driver interface
interface MockDriver {
  pool: MockPool;
}

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;
  let mockQueryRunner: Partial<QueryRunner>;
  let mockPool: MockPool;
  let mockConfigService: Partial<ConfigService>;
  let module: TestingModule;

  beforeEach(async () => {
    // Create mock query runner
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    // Create mock pool
    mockPool = {
      totalCount: 5,
      activeCount: 2,
      on: jest.fn(),
      drain: jest.fn(),
      clear: jest.fn(),
    };

    // Create mock data source
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      driver: {
        pool: mockPool,
      } as unknown as Driver,
    };

    // Create mock config service
    mockConfigService = {
      get: jest.fn().mockReturnValue('development'),
    };

    module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    // Clean up any mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close the module
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withTransaction', () => {
    it('should successfully execute and commit transaction', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await service.withTransaction(operation);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith(mockQueryRunner);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(service.withTransaction(operation)).rejects.toThrow(error);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should set up pool error handling', async () => {
      await service.onModuleInit();

      expect(mockPool.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
    });
  });

  describe('pool error handling', () => {
    it('should record error metrics', async () => {
      // Initialize the service
      await service.onModuleInit();
      
      const error = new Error('Pool error');
      
      // Get the error handler that was registered
      const errorHandler = mockPool.on.mock.calls[0][1];
      await errorHandler(error);

      expect(newrelic.noticeError).toHaveBeenCalledWith(error, {
        poolTotal: 5,
        poolActive: 2,
      });
    });
  });
});
