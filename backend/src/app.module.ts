import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { LoggingModule } from './common/logging/logging.module';
import { MonitoringModule } from './common/monitoring/monitoring.module';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { RedisCacheModule } from './common/cache/cache.module';
import { RateLimitingModule } from './common/rate-limiting/rate-limiting.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { CompressionModule } from './common/compression/compression.module';
import { CorsModule } from './common/cors/cors.module';
import { CachePolicyModule } from './common/cache-policy/cache-policy.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Core Modules
    LoggingModule,
    MonitoringModule,
    RedisCacheModule,
    RateLimitingModule,
    CompressionModule,
    CorsModule,
    CachePolicyModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
