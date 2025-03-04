/**
 * Database Connection Test Script
 * 
 * A simple script to test database connectivity.
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

// Try to connect
process.stdout.write('Attempting to connect to database...\n');

dataSource.initialize()
  .then(() => {
    process.stdout.write('Database connection successful!\n');
    
    // Try a simple query
    process.stdout.write('Running test query...\n');
    return dataSource.query('SELECT NOW() as time');
  })
  .then((result) => {
    process.stdout.write(`Query result: ${JSON.stringify(result)}\n`);
    process.stdout.write('Test completed successfully!\n');
    
    // Close connection
    return dataSource.destroy();
  })
  .then(() => {
    process.stdout.write('Database connection closed.\n');
    process.exit(0);
  })
  .catch((error) => {
    process.stderr.write(`ERROR: Database connection failed: ${error}\n`);
    if (error.stack) {
      process.stderr.write(`Stack trace: ${error.stack}\n`);
    }
    process.exit(1);
  }); 