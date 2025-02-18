import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RequestQueueService } from './request-queue.service';
import { queueConfigs, getDefaultQueueConfig } from '../../config/queue.config';
import { getRateLimitConfig } from '../../config/rate-limit.config';

/**
 * Module for handling request queuing and rate limiting
 * Configures Bull queues and Throttler for rate limiting
 */
@Module({
  imports: [
    // Configure rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRateLimitConfig,
    }),

    // Configure Bull queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDefaultQueueConfig,
    }),

    // Register individual queues
    BullModule.registerQueue(
      {
        name: queueConfigs.highPriority.name,
        defaultJobOptions: queueConfigs.highPriority.defaultJobOptions,
      },
      {
        name: queueConfigs.default.name,
        defaultJobOptions: queueConfigs.default.defaultJobOptions,
      },
      {
        name: queueConfigs.background.name,
        defaultJobOptions: queueConfigs.background.defaultJobOptions,
      },
    ),
  ],
  providers: [RequestQueueService],
  exports: [RequestQueueService],
})
export class QueueModule {}
