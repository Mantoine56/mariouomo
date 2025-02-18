import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

/**
 * Rate limiting configuration for different endpoints
 */
export interface RateLimitConfig {
  readonly ttl: number;      // Time-to-live in seconds
  readonly limit: number;    // Number of requests allowed within TTL
}

/**
 * Get rate limiting configuration based on environment
 * @param configService - NestJS ConfigService for environment variables
 */
export const getRateLimitConfig = (configService: ConfigService): ThrottlerModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    ttl: configService.get('RATE_LIMIT_TTL') || (isProduction ? 60 : 1),
    limit: configService.get('RATE_LIMIT_MAX') || (isProduction ? 100 : 1000),
  };
};

/**
 * Endpoint-specific rate limiting configurations
 * Stricter limits for sensitive operations
 */
export const endpointRateLimits = {
  // Authentication endpoints
  auth: {
    login: {
      ttl: 300,     // 5 minutes
      limit: 5,      // 5 attempts
    },
    register: {
      ttl: 3600,    // 1 hour
      limit: 3,      // 3 attempts
    },
    passwordReset: {
      ttl: 3600,    // 1 hour
      limit: 2,      // 2 attempts
    },
  },

  // API endpoints
  api: {
    default: {
      ttl: 60,      // 1 minute
      limit: 100,    // 100 requests
    },
    search: {
      ttl: 60,      // 1 minute
      limit: 30,     // 30 searches
    },
    order: {
      ttl: 300,     // 5 minutes
      limit: 10,     // 10 orders
    },
  },

  // Admin endpoints
  admin: {
    default: {
      ttl: 60,      // 1 minute
      limit: 50,     // 50 requests
    },
    bulk: {
      ttl: 300,     // 5 minutes
      limit: 5,      // 5 bulk operations
    },
  },
} as const;
