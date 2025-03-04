/**
 * Script to check the profiles table structure
 * This will help us understand how to properly seed profiles without
 * dependency on the users table in Supabase
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function main() {
  console.log('Checking profiles table structure...');
  
  // Load environment variables
  const envPath = process.env.NODE_ENV === 'production' 
    ? '.env' 
    : '.env.local';
  
  dotenv.config({ path: path.resolve(process.cwd(), envPath) });
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check table structure
    const tableResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    
    console.log('Profiles table structure:');
    console.table(tableResult.rows);
    
    // Check primary key
    const pkResult = await client.query(`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = 'profiles'::regclass AND i.indisprimary;
    `);
    
    console.log('Primary key columns:');
    console.table(pkResult.rows);
    
    // Check foreign keys
    const fkResult = await client.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'profiles';
    `);
    
    console.log('Foreign key constraints:');
    console.table(fkResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

main(); 