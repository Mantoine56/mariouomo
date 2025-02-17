import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { LoggingModule } from './common/logging/logging.module';
import { MonitoringModule } from './common/monitoring/monitoring.module';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { RedisCacheModule } from './common/cache/cache.module';

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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
