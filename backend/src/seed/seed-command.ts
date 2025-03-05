/**
 * Database Seed Command
 * 
 * This command file allows running the seed script from the command line.
 * Usage: nest start --entryFile seed/seed-command
 * Can be disabled with DISABLE_SEED=true environment variable
 */

import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { AnalyticsSeedService } from './analytics-seed';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SeedCommand provides a CLI command for database seeding
 * This allows easy population of test data via command line
 * Can be disabled with DISABLE_SEED=true environment variable
 */
@Command({ name: 'seed', description: 'Seed database with test data for analytics' })
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);
  private readonly isDisabled = process.env.DISABLE_SEED === 'true';
  
  constructor(private readonly seedService: AnalyticsSeedService) {
    super();
    // Force direct output to stdout
    process.stdout.write('SeedCommand constructor called\n');
    
    if (this.isDisabled) {
      process.stdout.write('SeedCommand is disabled via DISABLE_SEED environment variable\n');
      return; // Skip further initialization
    }
    
    // Create debug log file for tracking execution
    this.setupLogging();
    
    // Output again after setup
    process.stdout.write('SeedCommand initialization complete\n');
  }

  private debugLogFile: string | null;

  /**
   * Setup logging directory and files
   */
  private setupLogging(): void {
    // Skip if disabled
    if (this.isDisabled) return;
    
    try {
      process.stdout.write('Setting up logging...\n');
      
      const logDir = './debug-logs';
      // Create directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        process.stdout.write(`Creating log directory: ${logDir}\n`);
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Get current time for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.debugLogFile = path.join(logDir, `seed-command-${timestamp}.log`);
      
      // Write initial log entry
      this.writeToDebugLog('Seed command initialized');
      this.writeToDebugLog(`Current working directory: ${process.cwd()}`);
      this.writeToDebugLog(`NODE_ENV: ${process.env.NODE_ENV}`);
      
      process.stdout.write('Logging setup complete\n');
    } catch (error) {
      process.stderr.write(`Error setting up logging: ${error}\n`);
      // Try alternative directory
      try {
        const altLogDir = '/tmp/seed-logs';
        if (!fs.existsSync(altLogDir)) {
          process.stdout.write(`Creating alternative log directory: ${altLogDir}\n`);
          fs.mkdirSync(altLogDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.debugLogFile = path.join(altLogDir, `seed-command-${timestamp}.log`);
        this.writeToDebugLog('Seed command initialized using alternative log directory');
      } catch (altError) {
        process.stderr.write(`Failed to create even alternative log directory: ${altError}\n`);
        // Last resort - don't use file logging
        this.debugLogFile = null;
      }
    }
  }

  /**
   * Write to both stdout and a debug log file
   * This ensures we have a record even if console output is suppressed
   */
  private writeToDebugLog(message: string): void {
    // Skip if disabled
    if (this.isDisabled) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Always log to stdout
    process.stdout.write(`${message}\n`);
    
    // Write to file only if file path is set
    if (this.debugLogFile) {
      try {
        fs.appendFileSync(this.debugLogFile, logMessage);
      } catch (error) {
        process.stderr.write(`Error writing to log file: ${error.message}\n`);
      }
    }
  }

  /**
   * Run the seed command
   */
  async run(): Promise<void> {
    // Skip if disabled
    if (this.isDisabled) {
      this.logger.log('Seed command is disabled via DISABLE_SEED environment variable - skipping execution');
      return;
    }
    
    process.stdout.write('SeedCommand.run() called\n');
    this.writeToDebugLog('Starting database seed process');
    try {
      this.writeToDebugLog('About to call analyticsSeedService.seed()');
      
      // Set a timeout to log if the operation is taking too long
      const intervalId = setInterval(() => {
        process.stdout.write('Seed operation is still running...\n');
      }, 5000);
      
      // Execute the seed operation
      process.stdout.write('Calling analyticsSeedService.seed()...\n');
      await this.seedService.seed();
      
      // Clear the interval once the operation completes
      clearInterval(intervalId);
      
      this.writeToDebugLog('Database seed completed successfully!');
      
      // Force process exit after successful completion to prevent hanging
      this.writeToDebugLog('Exiting process with success code...');
      setTimeout(() => process.exit(0), 500);
      
    } catch (error) {
      this.writeToDebugLog(`Error during seed operation: ${error instanceof Error ? error.message : String(error)}`);
      
      if (error instanceof Error && error.stack) {
        this.writeToDebugLog(`Stack trace: ${error.stack}`);
      }
      
      this.writeToDebugLog('Database seed failed!');
      
      // Force process exit with error code
      this.writeToDebugLog('Exiting process with error code...');
      setTimeout(() => process.exit(1), 500);
    }
  }
} 