import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Rate limiting module that provides protection against brute force attacks
 * and prevents API abuse by limiting the number of requests per time window.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60), // Default: 60 seconds
        limit: config.get('THROTTLE_LIMIT', 100), // Default: 100 requests per TTL
      }),
    }),
  ],
})
export class RateLimitingModule {}
