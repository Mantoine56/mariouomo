/**
 * Seed Module
 * 
 * This module registers the seed service and its dependencies.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsSeedService } from './analytics-seed';
import { SeedCommand } from './seed-command';

/**
 * SeedModule handles database seeding operations
 * Provides commands and services for populating the database with test data
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
  ],
  providers: [
    AnalyticsSeedService,
    SeedCommand,
  ],
  exports: [
    AnalyticsSeedService,
  ],
})
export class SeedModule {} 