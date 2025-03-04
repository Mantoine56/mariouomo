/**
 * Check Database Triggers
 * 
 * A script to check for triggers on the stores table.
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
 * Check for triggers on the stores table
 */
async function checkTriggers(dataSource: DataSource): Promise<void> {
  try {
    // Check for triggers on the stores table
    process.stdout.write('Checking for triggers on the stores table...\n');
    const triggers = await dataSource.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'stores';
    `);
    
    if (triggers.length === 0) {
      process.stdout.write('No triggers found on the stores table.\n');
    } else {
      process.stdout.write(`Found ${triggers.length} triggers on the stores table:\n`);
      triggers.forEach((trigger: any, index: number) => {
        process.stdout.write(`Trigger ${index + 1}: ${trigger.trigger_name}\n`);
        process.stdout.write(`  Event: ${trigger.event_manipulation}\n`);
        process.stdout.write(`  Action: ${trigger.action_statement}\n`);
      });
    }
    
    // Check for trigger functions
    process.stdout.write('\nChecking for trigger functions...\n');
    const functions = await dataSource.query(`
      SELECT p.proname AS function_name, pg_get_functiondef(p.oid) AS function_def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname LIKE '%trigger%';
    `);
    
    if (functions.length === 0) {
      process.stdout.write('No trigger functions found in the public schema.\n');
    } else {
      process.stdout.write(`Found ${functions.length} trigger functions:\n`);
      functions.forEach((func: any, index: number) => {
        process.stdout.write(`Function ${index + 1}: ${func.function_name}\n`);
        process.stdout.write(`  Definition: ${func.function_def}\n`);
      });
    }
    
    // Check for RLS policies
    process.stdout.write('\nChecking for RLS policies on the stores table...\n');
    const policies = await dataSource.query(`
      SELECT tablename, policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'stores';
    `);
    
    if (policies.length === 0) {
      process.stdout.write('No RLS policies found on the stores table.\n');
    } else {
      process.stdout.write(`Found ${policies.length} RLS policies on the stores table:\n`);
      policies.forEach((policy: any, index: number) => {
        process.stdout.write(`Policy ${index + 1}: ${policy.policyname}\n`);
        process.stdout.write(`  Command: ${policy.cmd}\n`);
        process.stdout.write(`  Using: ${policy.qual}\n`);
        process.stdout.write(`  With Check: ${policy.with_check}\n`);
      });
    }
  } catch (error) {
    process.stderr.write(`Error checking triggers: ${error}\n`);
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
    
    // Check triggers
    await checkTriggers(dataSource);
    
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