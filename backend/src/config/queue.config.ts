import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bull';

/**
 * Queue configuration for different request types
 */
export interface QueueConfig {
  readonly name: string;
  readonly options: QueueOptions;
}

/**
 * Default queue configuration with Redis connection
 * @param configService - NestJS ConfigService for environment variables
 */
export const getDefaultQueueConfig = (configService: ConfigService): QueueOptions => ({
  redis: {
    host: configService.get('REDIS_HOST') || 'localhost',
    port: configService.get('REDIS_PORT') || 6379,
    password: configService.get('REDIS_PASSWORD'),
    tls: configService.get('REDIS_TLS') === 'true' ? {} : undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    timeout: 5000,
  },
});

/**
 * Queue configurations for different request types
 * Each queue can have its own specific settings while inheriting defaults
 */
export const queueConfigs = {
  // High priority requests (e.g., order processing)
  highPriority: {
    name: 'high-priority-queue',
    concurrency: 5,
    defaultJobOptions: {
      priority: 1,
      attempts: 5,
      timeout: 10000,
    },
  },

  // Regular API requests
  default: {
    name: 'default-queue',
    concurrency: 3,
    defaultJobOptions: {
      priority: 2,
      attempts: 3,
      timeout: 5000,
    },
  },

  // Background tasks (e.g., report generation)
  background: {
    name: 'background-queue',
    concurrency: 1,
    defaultJobOptions: {
      priority: 3,
      attempts: 2,
      timeout: 30000,
      delay: 1000,
    },
  },
} as const;
