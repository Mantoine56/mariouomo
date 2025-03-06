import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health Module
 * 
 * Provides health check functionality for the application.
 * This module is used for monitoring and status checks.
 */
@Module({
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
