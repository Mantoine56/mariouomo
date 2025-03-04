/**
 * Check Function Definition
 * 
 * A script to check the definition of the log_table_event function.
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
process.stdout.write('Loading environment variables...\n');
if (fs.existsSync('.env.local')) {
  process.stdout.write('Found .env.local file, loading...\n');
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  process.stdout.write('Found .env file, loading...\n');
  dotenv.config();
} else {
  process.stdout.write('No .env file found, using process environment\n');
}

// Get database connection string
const dbUrl = process.env.DATABASE_URL;
process.stdout.write(`Database URL: ${dbUrl ? 'Found' : 'Not found'}\n`);

if (!dbUrl) {
  process.stderr.write('ERROR: DATABASE_URL environment variable is not set\n');
  process.exit(1);
}

// Create a simple data source
const dataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  synchronize: false,
  logging: true,
  entities: [],
});

/**
 * Check the definition of the log_table_event function
 */
async function checkFunction(dataSource: DataSource): Promise<void> {
  try {
    // Check the log_table_event function
    process.stdout.write('Checking the log_table_event function...\n');
    const result = await dataSource.query(`
      SELECT pg_get_functiondef(oid) AS function_def
      FROM pg_proc
      WHERE proname = 'log_table_event';
    `);
    
    if (result.length === 0) {
      process.stdout.write('Function log_table_event not found.\n');
    } else {
      process.stdout.write('Function definition:\n');
      process.stdout.write(result[0].function_def + '\n');
    }
    
    // Check the update_updated_at_column function
    process.stdout.write('\nChecking the update_updated_at_column function...\n');
    const result2 = await dataSource.query(`
      SELECT pg_get_functiondef(oid) AS function_def
      FROM pg_proc
      WHERE proname = 'update_updated_at_column';
    `);
    
    if (result2.length === 0) {
      process.stdout.write('Function update_updated_at_column not found.\n');
    } else {
      process.stdout.write('Function definition:\n');
      process.stdout.write(result2[0].function_def + '\n');
    }
  } catch (error) {
    process.stderr.write(`Error checking function: ${error}\n`);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Connect to database
    process.stdout.write('Connecting to database...\n');
    await dataSource.initialize();
    process.stdout.write('Database connection successful!\n');
    
    // Check function
    await checkFunction(dataSource);
    
    // Close connection
    await dataSource.destroy();
    process.stdout.write('Database connection closed.\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`ERROR: Check failed: ${error}\n`);
    if (error.stack) {
      process.stderr.write(`Stack trace: ${error.stack}\n`);
    }
    
    // Try to close connection if it's open
    if (dataSource.isInitialized) {
      try {
        await dataSource.destroy();
        process.stdout.write('Database connection closed.\n');
      } catch (closeError) {
        process.stderr.write(`Error closing database connection: ${closeError}\n`);
      }
    }
    
    process.exit(1);
  }
}

// Run the main function
main(); 