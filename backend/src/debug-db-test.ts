// Load environment variables first
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local first, then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Load default .env files if .env.local doesn't exist

import { createConnection } from 'typeorm';

/**
 * Test database connection with explicit configuration
 */
async function testDatabaseConnection() {
  console.log('Testing database connection to Supabase...');
  console.log(`DATABASE_URL from env: ${process.env.DATABASE_URL || 'not set'}`);
  console.log('Current working directory:', process.cwd());
  
  try {
    // Explicitly parse connection details for more control
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Log the connection attempt
    console.log('Attempting to connect to database using explicit configuration...');
    
    const connection = await createConnection({
      type: 'postgres',
      url: dbUrl,
      ssl: {
        rejectUnauthorized: false // Important for Supabase connections
      },
      // Only connect, don't try to sync entities
      synchronize: false,
      entities: [],
      logging: ['error', 'query', 'schema'],
    });
    
    console.log('Successfully connected to the database!');
    
    // Use type assertion to access connection details
    const connectionOptions = connection.options as any;
    console.log('Database name:', connectionOptions.database);
    console.log('Connected as user:', connectionOptions.username);
    
    // Run a simple query to verify connection works
    const result = await connection.query('SELECT NOW()');
    console.log('Database time:', result[0].now);
    
    // Close the connection
    await connection.close();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

// Run the test
testDatabaseConnection().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 