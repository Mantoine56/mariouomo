import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import Redis from 'ioredis';

/**
 * Redis cache module that provides caching functionality using Redis.
 * Uses ioredis for Redis client implementation.
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
        return new Redis(redisUrl);
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class RedisCacheModule {}
