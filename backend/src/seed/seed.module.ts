/**
 * Seed Module
 * 
 * This module registers the seed service and its dependencies.
 * The module can be disabled using the DISABLE_SEED=true environment variable
 */

import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsSeedService } from './analytics-seed';
import { SeedCommand } from './seed-command';

/**
 * OptionalSeedService is used when DISABLE_SEED=true
 * This prevents the actual seed service from being instantiated
 * but still satisfies the dependency injection requirements
 */
class OptionalSeedService {
  private readonly logger = new Logger('OptionalSeedService');
  constructor() {
    this.logger.log('Seed service is disabled via DISABLE_SEED environment variable');
  }
  
  // Implement a mock seed method that does nothing
  async seed(): Promise<void> {
    this.logger.log('Seed method called but disabled - no action taken');
    return Promise.resolve();
  }
}

/**
 * SeedModule handles database seeding operations
 * Provides commands and services for populating the database with test data
 * Can be disabled with DISABLE_SEED=true environment variable
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
  ],
  providers: [
    // Conditionally provide the real or mock seed service
    {
      provide: AnalyticsSeedService,
      useClass: process.env.DISABLE_SEED === 'true' ? OptionalSeedService : AnalyticsSeedService,
    },
    SeedCommand,
  ],
  exports: [
    AnalyticsSeedService,
  ],
})
export class SeedModule {} 