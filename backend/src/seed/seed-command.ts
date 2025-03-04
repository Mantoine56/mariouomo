/**
 * Database Seed Command
 * 
 * This command file allows running the seed script from the command line.
 * Usage: nest start --entryFile seed/seed-command
 */

import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { AnalyticsSeedService } from './analytics-seed';

/**
 * SeedCommand provides a CLI command for database seeding
 * This allows easy population of test data via command line
 */
@Injectable()
@Command({ name: 'seed', description: 'Seed database with test data for analytics' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedService: AnalyticsSeedService) {
    super();
  }

  /**
   * Run the seed command
   */
  async run(): Promise<void> {
    console.log('Starting database seed process...');
    try {
      await this.seedService.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      process.exit(1);
    }
  }
} 