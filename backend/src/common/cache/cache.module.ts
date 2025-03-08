import { Module, Logger } from '@nestjs/common';
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
        const logger = new Logger('RedisCacheModule');
        const redisUrl = configService.get<string>('REDIS_URL') || configService.get<string>('redis.url');
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!redisUrl) {
          const errorMessage = 'Redis URL is not configured';
          logger.error(errorMessage);
          
          if (isDevelopment) {
            logger.warn('Running in development mode without Redis. Some features may not work correctly.');
            // Return a dummy client that logs operations but doesn't throw errors
            return {
              get: (key: string) => {
                logger.debug(`[REDIS MOCK] GET ${key}`);
                return null;
              },
              set: (key: string, value: string) => {
                logger.debug(`[REDIS MOCK] SET ${key}`);
                return 'OK';
              },
              del: (key: string) => {
                logger.debug(`[REDIS MOCK] DEL ${key}`);
                return 1;
              },
              flushall: () => {
                logger.debug('[REDIS MOCK] FLUSHALL');
                return 'OK';
              },
              quit: () => Promise.resolve('OK'),
              on: () => {},
            };
          }
          
          throw new Error(errorMessage);
        }

        logger.log(`Connecting to Redis at ${redisUrl.replace(/\/\/([^@]*)@/, '//***@')}`);
        const isLocal = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
        
        try {
          const client = new Redis(redisUrl, {
            tls: isLocal ? undefined : {
              rejectUnauthorized: false
            },
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 50, 2000);
              logger.debug(`Redis connection retry ${times}, delay ${delay}ms`);
              return delay;
            },
            maxRetriesPerRequest: 5,
            enableReadyCheck: true
          });
          
          client.on('connect', () => {
            logger.log('Successfully connected to Redis');
          });
          
          client.on('error', (err) => {
            logger.error(`Redis connection error: ${err.message}`);
          });
          
          return client;
        } catch (error) {
          logger.error(`Failed to create Redis client: ${error.message}`);
          
          if (isDevelopment) {
            logger.warn('Falling back to dummy implementation in development mode');
            // Return a dummy client that logs operations but doesn't throw errors
            return {
              get: (key: string) => {
                logger.debug(`[REDIS MOCK] GET ${key}`);
                return null;
              },
              set: (key: string, value: string) => {
                logger.debug(`[REDIS MOCK] SET ${key}`);
                return 'OK';
              },
              del: (key: string) => {
                logger.debug(`[REDIS MOCK] DEL ${key}`);
                return 1;
              },
              flushall: () => {
                logger.debug('[REDIS MOCK] FLUSHALL');
                return 'OK';
              },
              quit: () => Promise.resolve('OK'),
              on: () => {},
            };
          }
          
          throw error;
        }
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class RedisCacheModule {}
