import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheHeadersInterceptor } from '../interceptors/cache-headers.interceptor';

/**
 * Module that manages HTTP caching policies across the application.
 * Provides:
 * - Cache-Control headers configuration
 * - ETag generation and validation
 * - Conditional request handling
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheHeadersInterceptor,
    },
  ],
})
export class CachePolicyModule {}
