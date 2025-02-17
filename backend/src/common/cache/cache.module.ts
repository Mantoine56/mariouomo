import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import Redis from 'ioredis';

/**
 * Redis cache module that provides caching functionality using Redis.
 * Uses ioredis for Redis client implementation with TLS support for Upstash.
 */
@Module({
  imports: [ConfigModule],
  controllers: [CacheController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('redis.url');
        if (!redisUrl) {
          throw new Error('Redis URL is not configured');
        }

        return new Redis(redisUrl, {
          tls: {
            rejectUnauthorized: false
          },
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 5,
          enableReadyCheck: false
        });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class RedisCacheModule {}
