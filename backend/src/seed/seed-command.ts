/**
 * Database Seed Command
 * 
 * This command file allows running the seed script from the command line.
 * Usage: nest start --entryFile seed/seed-command
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AnalyticsSeedService } from './analytics-seed';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seed process...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seedService = app.get(AnalyticsSeedService);
    
    logger.log('Seed service initialized. Beginning data generation...');
    await seedService.seed();
    
    logger.log('Database seeding completed successfully!');
    await app.close();
  } catch (error) {
    logger.error(`Error during seeding process: ${error.message}`, error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

bootstrap(); 