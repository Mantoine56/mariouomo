import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RealTimeTrackingService } from '../../../src/modules/analytics/services/real-time-tracking.service';
import { RealTimeMetrics } from '../../../src/modules/analytics/entities/real-time-metrics.entity';
import { DbUtilsTestService } from '../../utils/db-utils-test.service';
import { ShoppingCartTestRepository } from '../../utils/shopping-cart-test.repository';

/**
 * Test module specifically for RealTimeTrackingService tests
 * Provides all necessary dependencies with real database access
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [RealTimeMetrics],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([RealTimeMetrics]),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    RealTimeTrackingService,
    DbUtilsTestService,
    ShoppingCartTestRepository,
    {
      provide: 'DbUtilsService',
      useExisting: DbUtilsTestService
    },
    {
      provide: 'ShoppingCartRepository',
      useExisting: ShoppingCartTestRepository
    }
  ],
  exports: [
    RealTimeTrackingService,
    TypeOrmModule
  ],
})
export class RealTimeTrackingTestModule {} 