import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

/**
 * Script to generate SQL schema based on entity definitions
 * 
 * This script initializes the NestJS application, gets the TypeORM DataSource,
 * and generates SQL statements to create all tables defined by entities.
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register src/scripts/generate-schema.ts
 */
async function bootstrap() {
  console.log('Initializing application to generate schema...');
  // Create a standalone NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn']
  });

  try {
    // Get TypeORM DataSource from the application
    const dataSource = app.get<DataSource>(getDataSourceToken());
    
    console.log('Generating schema SQL...');
    
    // Generate SQL statements by syncing without executing
    // This gives us the SQL necessary to create all the tables
    const schemaBuilder = dataSource.driver.createSchemaBuilder();
    const sql = await schemaBuilder.log();
    
    // Convert to array if it's not already
    const sqlQueries = Array.isArray(sql) ? sql : Object.values(sql);
    
    // Format SQL with semicolons and newlines
    const formattedSQL = sqlQueries
      .filter((query: string) => query.trim().length > 0)
      .join(';\n\n') + ';';
    
    // Write to schema.sql file
    const outputPath = path.join(process.cwd(), 'schema.sql');
    fs.writeFileSync(outputPath, formattedSQL);
    
    console.log(`Schema SQL generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  } finally {
    // Clean up
    await app.close();
  }
}

// Run the script
bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
}); 