import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Service for managing Redis cache operations.
 * Provides methods for getting, setting, deleting, and resetting cache entries.
 */
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Retrieve a value from the cache by its key.
   * @param key - The key to look up in the cache
   * @returns The cached value if found, null otherwise
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Store a value in the cache with an optional TTL.
   * @param key - The key under which to store the value
   * @param value - The value to store
   * @param ttl - Optional time-to-live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Remove a value from the cache.
   * @param key - The key to remove from the cache
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Clear all entries from the cache.
   * WARNING: This will remove ALL data from Redis.
   */
  async reset(): Promise<void> {
    await this.redis.flushall();
  }
}
