/**
 * Check Schema Script
 * 
 * A script to check the database schema for specific tables.
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
 * Check table schema
 */
async function checkTableSchema(dataSource: DataSource, tableName: string): Promise<void> {
  try {
    process.stdout.write(`Checking schema for table: ${tableName}...\n`);
    
    // Check if table exists
    const tableExistsResult = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = current_schema() 
        AND table_name = $1
      );
    `, [tableName]);
    
    const tableExists = tableExistsResult[0].exists;
    
    if (!tableExists) {
      process.stdout.write(`Table '${tableName}' does not exist.\n`);
      return;
    }
    
    // Get column information
    const columnsResult = await dataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = current_schema()
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    process.stdout.write(`\nColumns for table '${tableName}':\n`);
    process.stdout.write('------------------------------------\n');
    process.stdout.write('Column Name | Data Type | Nullable | Default\n');
    process.stdout.write('------------------------------------\n');
    
    for (const column of columnsResult) {
      process.stdout.write(`${column.column_name} | ${column.data_type} | ${column.is_nullable} | ${column.column_default || 'NULL'}\n`);
    }
    
    // Get primary key information
    const primaryKeyResult = await dataSource.query(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass
      AND i.indisprimary;
    `, [tableName]);
    
    if (primaryKeyResult.length > 0) {
      const primaryKeys = primaryKeyResult.map((row: any) => row.attname).join(', ');
      process.stdout.write(`\nPrimary Key: ${primaryKeys}\n`);
    } else {
      process.stdout.write('\nNo Primary Key defined\n');
    }
    
    // Get foreign key information
    const foreignKeysResult = await dataSource.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = $1;
    `, [tableName]);
    
    if (foreignKeysResult.length > 0) {
      process.stdout.write('\nForeign Keys:\n');
      process.stdout.write('------------------------------------\n');
      process.stdout.write('Column | References | Foreign Column\n');
      process.stdout.write('------------------------------------\n');
      
      for (const fk of foreignKeysResult) {
        process.stdout.write(`${fk.column_name} | ${fk.foreign_table_name} | ${fk.foreign_column_name}\n`);
      }
    } else {
      process.stdout.write('\nNo Foreign Keys defined\n');
    }
    
    // Get index information
    const indexesResult = await dataSource.query(`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
      AND t.relname = $1
      ORDER BY i.relname, a.attnum;
    `, [tableName]);
    
    if (indexesResult.length > 0) {
      process.stdout.write('\nIndexes:\n');
      process.stdout.write('------------------------------------\n');
      process.stdout.write('Index Name | Column | Unique\n');
      process.stdout.write('------------------------------------\n');
      
      for (const idx of indexesResult) {
        process.stdout.write(`${idx.index_name} | ${idx.column_name} | ${idx.is_unique ? 'Yes' : 'No'}\n`);
      }
    } else {
      process.stdout.write('\nNo Indexes defined\n');
    }
    
  } catch (error) {
    process.stderr.write(`Error checking schema for table '${tableName}': ${error}\n`);
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
    
    // Check schema for auth_users table
    await checkTableSchema(dataSource, 'auth_users');
    
    // Check schema for profiles table
    await checkTableSchema(dataSource, 'profiles');
    
    // Check schema for orders table
    await checkTableSchema(dataSource, 'orders');
    
    // Check schema for order_items table
    await checkTableSchema(dataSource, 'order_items');
    
    // Close connection
    await dataSource.destroy();
    process.stdout.write('\nDatabase connection closed.\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`ERROR: Schema check failed: ${error}\n`);
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