import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import Redis from 'ioredis';

/**
 * Redis Cache Module that provides a Redis client
 * 
 * In development mode, it provides a mock client if no Redis URL is configured.
 * In production, it will throw an error if Redis is not configured.
 */
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<CacheModuleOptions> => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const logger = new Logger('RedisCacheModule');
        const redisEnabled = configService.get<string>('REDIS_ENABLED') !== 'false';
        
        // If Redis is explicitly disabled or we're in a test environment and no URL is provided, use a mock client
        if (!redisEnabled || (process.env.NODE_ENV === 'test' && !redisUrl)) {
          logger.log('Using Redis mock client for testing environment');
          return {
            store: {
              // Use memory store for cache as fallback
              create: () => ({
                get: async (key: string) => {
                  logger.debug(`[REDIS MOCK] GET ${key}`);
                  return null;
                },
                set: async (key: string, value: any, ttl?: number) => {
                  logger.debug(`[REDIS MOCK] SET ${key} ${ttl ? `TTL: ${ttl}` : ''}`);
                  return true;
                },
                del: async (key: string) => {
                  logger.debug(`[REDIS MOCK] DEL ${key}`);
                  return 1;
                },
                flushall: () => {
                  logger.debug('[REDIS MOCK] FLUSHALL');
                  return 'OK';
                },
                quit: () => Promise.resolve('OK'),
                on: () => {},
              }),
            },
            ttl: 300, // Default TTL: 5 minutes
          };
        }
        
        // For production and configured test environments with Redis
        if (!redisUrl) {
          const errorMessage = 'Redis URL is not configured';
          logger.error(errorMessage);
          
          if (process.env.NODE_ENV === 'test') {
            // For tests, provide a mock instead of failing
            logger.warn('Falling back to mock Redis client for tests');
            return {
              store: {
                create: () => ({
                  get: async () => null,
                  set: async () => true,
                  del: async () => 1,
                  flushall: () => 'OK',
                  quit: () => Promise.resolve('OK'),
                  on: () => {},
                }),
              },
              ttl: 300, // Default TTL: 5 minutes
            };
          }
          
          throw new Error(errorMessage);
        }

        logger.log(`Connecting to Redis at ${redisUrl.replace(/\/\/([^@]*)@/, '//***@')}`);
        const isLocal = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
        
        try {
          // Return cache options with Redis store for production
          return {
            store: {
              create: () => new Redis(redisUrl, {
                tls: isLocal ? undefined : {
                  rejectUnauthorized: false
                },
                retryStrategy: (times) => {
                  const delay = Math.min(times * 50, 2000);
                  return delay;
                },
                connectTimeout: 10000,
                maxRetriesPerRequest: 5,
              }),
            },
            ttl: 300, // Default TTL: 5 minutes
          };
        } catch (error) {
          logger.error(`Failed to create Redis client: ${error.message}`);
          
          if (process.env.NODE_ENV === 'test') {
            logger.warn('Falling back to mock Redis client for tests');
            return {
              store: {
                create: () => ({
                  get: async () => null,
                  set: async () => true,
                  del: async () => 1,
                  flushall: () => 'OK',
                  quit: () => Promise.resolve('OK'),
                  on: () => {},
                }),
              },
              ttl: 300, // Default TTL: 5 minutes
            };
          }
          
          throw new Error(`Failed to connect to Redis: ${error.message}`);
        }
      },
    }),
  ],
  controllers: [CacheController],
  providers: [
    CacheService,
    // Add missing Redis client provider
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const logger = new Logger('RedisCacheModule');
        const redisEnabled = configService.get<string>('REDIS_ENABLED') !== 'false';
        
        // If Redis is disabled or we're in a test environment without a URL, use a mock client
        if (!redisEnabled || (process.env.NODE_ENV === 'test' && !redisUrl)) {
          logger.log('Using Redis mock client for REDIS_CLIENT token');
          return {
            get: async (key: string) => {
              logger.debug(`[REDIS MOCK] GET ${key}`);
              return null;
            },
            set: async (key: string, value: any, ...args: any[]) => {
              logger.debug(`[REDIS MOCK] SET ${key}`);
              return 'OK';
            },
            del: async (key: string) => {
              logger.debug(`[REDIS MOCK] DEL ${key}`);
              return 1;
            },
            keys: async (pattern: string) => {
              logger.debug(`[REDIS MOCK] KEYS ${pattern}`);
              return [];
            },
            flushall: () => {
              logger.debug('[REDIS MOCK] FLUSHALL');
              return 'OK';
            }
          };
        }
        
        if (!redisUrl) {
          const errorMessage = 'Redis URL is not configured';
          logger.error(errorMessage);
          
          if (process.env.NODE_ENV === 'test') {
            // For tests, provide a mock instead of failing
            logger.warn('Falling back to mock Redis client for tests');
            return {
              get: async () => null,
              set: async () => 'OK',
              del: async () => 1,
              keys: async () => [],
              flushall: () => 'OK'
            };
          }
          
          throw new Error(errorMessage);
        }
        
        logger.log(`Creating Redis client for REDIS_CLIENT token`);
        const isLocal = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
        
        return new Redis(redisUrl, {
          tls: isLocal ? undefined : {
            rejectUnauthorized: false
          },
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          connectTimeout: 10000,
          maxRetriesPerRequest: 5,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    CacheService,
    NestCacheModule,
    'REDIS_CLIENT', // Export the Redis client
  ],
})
export class RedisCacheModule {}
