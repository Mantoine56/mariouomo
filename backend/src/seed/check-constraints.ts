import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Loads environment variables from .env files
 */
async function loadEnv(): Promise<void> {
  console.log('Loading environment variables...');
  
  // First, load from .env file
  dotenv.config();
  
  // Then, try to load from .env.local which would override .env
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    console.log('Found .env.local file, loading...');
    dotenv.config({ path: localEnvPath });
  }
  
  // Check if we have a database URL
  if (process.env.DATABASE_URL) {
    console.log('Database URL: Found');
  } else {
    console.log('Database URL: Not found');
  }
}

/**
 * Establishes a connection to the database
 */
async function connectToDatabase(): Promise<DataSource> {
  console.log('Connecting to database...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [],
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  console.log('Database connection successful!');
  
  return dataSource;
}

/**
 * Check foreign key constraints for the orders table
 */
async function checkConstraints(dataSource: DataSource): Promise<void> {
  try {
    // Check constraints on orders table
    console.log('Checking constraints on orders table...');
    
    const orderConstraints = await dataSource.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'orders';
    `);
    
    if (orderConstraints.length === 0) {
      console.log('No foreign key constraints found on orders table.');
    } else {
      console.log('Foreign key constraints on orders table:');
      console.table(orderConstraints);
    }

    // Also check constraints on profiles table
    console.log('\nChecking constraints on profiles table...');
    
    const profileConstraints = await dataSource.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'profiles';
    `);

    if (profileConstraints.length === 0) {
      console.log('No foreign key constraints found on profiles table.');
    } else {
      console.log('Foreign key constraints on profiles table:');
      console.table(profileConstraints);
    }
  } catch (error) {
    console.error('Error checking constraints:', error);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await loadEnv();
    const dataSource = await connectToDatabase();
    
    await checkConstraints(dataSource);
    
    await dataSource.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 