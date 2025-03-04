/**
 * Simplified Seed Script
 * 
 * A basic script to test seeding functionality by creating a store.
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
 * Create a store in the database using direct SQL with specific triggers disabled
 */
async function createStore(dataSource: DataSource): Promise<any> {
  process.stdout.write('Creating store...\n');
  
  // Generate a UUID for the store
  const storeId = uuidv4();
  const now = new Date().toISOString();
  
  // Create store metadata
  const metadata = JSON.stringify({
    location: 'New York',
    established: '2020',
    flagship: true,
    contact_email: 'store@mariouomo.com',
    contact_phone: '+1-555-123-4567',
    currency: 'USD'
  });
  
  try {
    // First check if the stores table exists
    process.stdout.write('Checking if stores table exists...\n');
    const tableCheck = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stores'
      );
    `);
    
    const tableExists = tableCheck[0].exists;
    process.stdout.write(`Stores table exists: ${tableExists}\n`);
    
    if (!tableExists) {
      process.stderr.write('ERROR: Stores table does not exist in the database\n');
      throw new Error('Stores table does not exist');
    }
    
    // Start a transaction
    process.stdout.write('Starting transaction...\n');
    await dataSource.query('BEGIN');
    
    // Temporarily disable specific triggers
    process.stdout.write('Temporarily disabling specific triggers on stores table...\n');
    await dataSource.query('ALTER TABLE stores DISABLE TRIGGER audit_stores');
    await dataSource.query('ALTER TABLE stores DISABLE TRIGGER update_stores_updated_at');
    
    // Insert the store using direct SQL
    process.stdout.write('Inserting store record...\n');
    const result = await dataSource.query(`
      INSERT INTO stores (id, name, domain, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [storeId, 'Mario Uomo Main Store', 'mariouomo.com', metadata, now, now]);
    
    // Re-enable specific triggers
    process.stdout.write('Re-enabling specific triggers on stores table...\n');
    await dataSource.query('ALTER TABLE stores ENABLE TRIGGER audit_stores');
    await dataSource.query('ALTER TABLE stores ENABLE TRIGGER update_stores_updated_at');
    
    // Commit the transaction
    process.stdout.write('Committing transaction...\n');
    await dataSource.query('COMMIT');
    
    process.stdout.write(`Store created with ID: ${result[0].id}\n`);
    return result[0];
  } catch (error) {
    // Rollback on error
    process.stderr.write(`Error creating store: ${error}\n`);
    process.stdout.write('Rolling back transaction...\n');
    await dataSource.query('ROLLBACK');
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
    
    // Create store
    const store = await createStore(dataSource);
    process.stdout.write(`Store created: ${JSON.stringify(store)}\n`);
    
    // Close connection
    await dataSource.destroy();
    process.stdout.write('Database connection closed.\n');
    process.stdout.write('Seed completed successfully!\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`ERROR: Seed failed: ${error}\n`);
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