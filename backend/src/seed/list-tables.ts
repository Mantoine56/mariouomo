/**
 * List Tables Script
 * 
 * A script to list all tables in the database.
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
 * List all tables in the database
 */
async function listTables(dataSource: DataSource): Promise<void> {
  try {
    process.stdout.write('Listing all tables in the database...\n');
    
    // Get all tables in the current schema
    const tablesResult = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    if (tablesResult.length === 0) {
      process.stdout.write('No tables found in the database.\n');
      return;
    }
    
    process.stdout.write(`\nFound ${tablesResult.length} tables:\n`);
    process.stdout.write('------------------------------------\n');
    
    for (const table of tablesResult) {
      process.stdout.write(`${table.table_name}\n`);
    }
    
  } catch (error) {
    process.stderr.write(`Error listing tables: ${error}\n`);
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
    
    // List all tables
    await listTables(dataSource);
    
    // Close connection
    await dataSource.destroy();
    process.stdout.write('\nDatabase connection closed.\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`ERROR: Failed to list tables: ${error}\n`);
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