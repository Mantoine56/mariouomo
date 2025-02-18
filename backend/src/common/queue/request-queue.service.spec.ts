import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { RequestQueueService } from './request-queue.service';
import { queueConfigs } from '../../config/queue.config';
import * as newrelic from 'newrelic';

// Mock newrelic
jest.mock('newrelic', () => ({
  recordMetric: jest.fn(),
}));

describe('RequestQueueService', () => {
  let service: RequestQueueService;
  let highPriorityQueue: any;
  let defaultQueue: any;
  let backgroundQueue: any;

  const mockQueue = {
    add: jest.fn(),
    on: jest.fn(),
    getJobCounts: jest.fn(),
    getCompletedCount: jest.fn(),
    getFailedCount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestQueueService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getQueueToken(queueConfigs.highPriority.name),
          useValue: { ...mockQueue, name: queueConfigs.highPriority.name },
        },
        {
          provide: getQueueToken(queueConfigs.default.name),
          useValue: { ...mockQueue, name: queueConfigs.default.name },
        },
        {
          provide: getQueueToken(queueConfigs.background.name),
          useValue: { ...mockQueue, name: queueConfigs.background.name },
        },
      ],
    }).compile();

    service = module.get<RequestQueueService>(RequestQueueService);
    highPriorityQueue = module.get(getQueueToken(queueConfigs.highPriority.name));
    defaultQueue = module.get(getQueueToken(queueConfigs.default.name));
    backgroundQueue = module.get(getQueueToken(queueConfigs.background.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should set up queue handlers and start monitoring', async () => {
      await service.onModuleInit();

      // Verify event handlers were set up for each queue
      expect(highPriorityQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(highPriorityQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(highPriorityQueue.on).toHaveBeenCalledWith('stalled', expect.any(Function));

      expect(defaultQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(defaultQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(defaultQueue.on).toHaveBeenCalledWith('stalled', expect.any(Function));

      expect(backgroundQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(backgroundQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(backgroundQueue.on).toHaveBeenCalledWith('stalled', expect.any(Function));
    });
  });

  describe('addToQueue', () => {
    const testData = { test: 'data' };

    it('should add job to high priority queue', async () => {
      const mockJob = { id: 'test-job-1' };
      highPriorityQueue.add.mockResolvedValue(mockJob);

      const result = await service.addToQueue(testData, 'high');

      expect(result).toBe(mockJob);
      expect(highPriorityQueue.add).toHaveBeenCalledWith(
        'process',
        testData,
        queueConfigs.highPriority.defaultJobOptions,
      );
    });

    it('should add job to default queue when no priority specified', async () => {
      const mockJob = { id: 'test-job-2' };
      defaultQueue.add.mockResolvedValue(mockJob);

      const result = await service.addToQueue(testData);

      expect(result).toBe(mockJob);
      expect(defaultQueue.add).toHaveBeenCalledWith(
        'process',
        testData,
        queueConfigs.default.defaultJobOptions,
      );
    });

    it('should add job to background queue', async () => {
      const mockJob = { id: 'test-job-3' };
      backgroundQueue.add.mockResolvedValue(mockJob);

      const result = await service.addToQueue(testData, 'background');

      expect(result).toBe(mockJob);
      expect(backgroundQueue.add).toHaveBeenCalledWith(
        'process',
        testData,
        queueConfigs.background.defaultJobOptions,
      );
    });
  });

  describe('Queue Monitoring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      
      // Mock queue metric methods
      const mockMetrics = {
        waiting: 5,
        active: 2,
      };
      highPriorityQueue.getJobCounts.mockResolvedValue(mockMetrics);
      highPriorityQueue.getCompletedCount.mockResolvedValue(10);
      highPriorityQueue.getFailedCount.mockResolvedValue(1);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should record queue metrics', async () => {
      await service.onModuleInit();

      // Fast-forward time to trigger monitoring
      await jest.advanceTimersByTimeAsync(60000);

      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        `queue.${queueConfigs.highPriority.name}.waiting`,
        5,
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        `queue.${queueConfigs.highPriority.name}.active`,
        2,
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        `queue.${queueConfigs.highPriority.name}.completed`,
        10,
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        `queue.${queueConfigs.highPriority.name}.failed`,
        1,
      );
    });
  });
});
