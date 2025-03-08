# Database Migration Plan: Test Environment Separation

## Current Situation Analysis

After analyzing the database schema and code, we've identified several inconsistencies between test and production environments:

### Database Schema Issues

1. **Tables with both regular and test versions (inconsistent naming):**
   - Several entities have both regular tables and `test_` prefixed versions
   - This creates confusion about which tables are actually used in production

2. **Test-only tables without production equivalents:**
   - We found 24 tables with `test_` prefix that don't have corresponding production tables
   - Example: `test_addresses` exists but no `addresses` table

3. **Production tables without test equivalents:**
   - We found 25 production tables that don't have corresponding test tables
   - Example: `product_views` exists but no `test_product_views` table

### Current Testing Approach

- Currently using a table prefix strategy (`test_` prefix)
- Test tables share the same database as production tables
- The `.env.test` file configures the test environment to use the `test_` prefix
- The testing framework has utilities to create and clean these test tables

## Core Tables Analysis

Our codebase analysis shows the following essential tables that are actually used:

### Core Business Logic Tables (23 tables)
- `products`, `product_variants`, `product_images`, `categories`, `categories_closure`
- `inventory_items`
- `orders`, `order_items`
- `stores`
- `profiles`, `addresses`, `user_addresses`
- `payments`, `shipments`
- `discounts`, `discount_products`, `discount_stores`
- `gift_cards`
- `events`
- `shopping_carts`, `cart_items`
- `product_categories` (junction table)

### Analytics Tables (4 tables)
- `sales_metrics`
- `inventory_metrics`
- `customer_metrics`
- `real_time_metrics`

### Specialized Tables (4 tables)
- `sessions`
- `rate_limits`
- `refunds`
- `product_views`

## Migration Goals

1. **Environment Isolation**: Completely separate test and production environments
2. **Schema Consistency**: Ensure test and production schemas match what's actually used in the code
3. **Data Security**: Prevent accidental corruption of production data during testing
4. **Simplified Configuration**: Make environment management more straightforward
5. **Best Practices**: Align with industry best practices for testing

## Implementation Plan

### Phase 1: Setup Separate Test Database in Supabase (Week 1) ✅

1. **Create a new test project in Supabase** ✅
   - Go to Supabase dashboard and create a new project called `mariouomo-backend-test`
   - Ensure it's in the same region as the production database
   - Set up appropriate access controls

2. **Update environment configuration files** ✅
   - Modify `.env.test` to point to the new test database:
   ```
   # Current
   DATABASE_TABLE_PREFIX=test_
   
   # New (remove prefix, add new connection details)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[TEST-PROJECT-ID].supabase.co:5432/postgres
   # Remove DATABASE_TABLE_PREFIX
   ```

3. **Update test configuration code** ✅
   - Modify `backend/src/config/test-database.config.ts` to remove prefix logic:
   ```typescript
   // Before
   const tablePrefix = configService.get<string>('DATABASE_TABLE_PREFIX', 'test_');
   
   // After
   // Remove tablePrefix and entityPrefix references
   ```
   - Update `backend/test/utils/test-db-utils.ts` to remove prefix from table names

### Phase 2: Schema Migration Process (Week 2) ✅

#### Step-by-Step Migration Process for Supabase

1. **Use Supabase UI to generate schema:** ✅

Since we're experiencing connection issues with the TypeORM script, we'll use Supabase's built-in SQL editor to extract the schema:

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query with the following SQL to extract schema for the core tables we identified:

```sql
-- Generate CREATE TABLE statements for our core tables
SELECT 
  'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
  string_agg(
    column_name || ' ' || 
    data_type || 
    CASE 
      WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
      ELSE ''
    END ||
    CASE 
      WHEN is_nullable = 'NO' THEN ' NOT NULL'
      ELSE ''
    END ||
    CASE 
      WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ', '
  ) || ');' AS create_table_statement
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public'
  AND table_name IN (
    'products', 'product_variants', 'product_images', 'categories', 'categories_closure',
    'inventory_items', 'orders', 'order_items', 'stores', 'profiles', 
    'addresses', 'user_addresses', 'payments', 'shipments', 'discounts',
    'gift_cards', 'events', 'shopping_carts', 'cart_items', 'product_categories',
    'sales_metrics', 'inventory_metrics', 'customer_metrics', 'real_time_metrics'
  )
GROUP BY 
  table_name;
```

4. Run this query and export the results
5. Review the generated SQL statements to ensure they match our core tables

2. **Clean up production database first:** ✅

Before creating a separate test database, we need to clean up our production database:

1. Analysis revealed several missing core tables in production:
   - `addresses`, `categories`, `categories_closure`, `product_categories`

2. Create the missing tables in production:
   - See `scripts/create_missing_tables.sql` for the complete script
   - This script creates all missing tables with proper constraints and indexes

3. After verifying the new tables work correctly:
   - Use `scripts/drop_test_tables.sql` to remove all test tables ✅
   - This ensures our production database has a clean, consistent schema ✅

### Phase 3: Clone Production Schema to Test Database (Week 2-3) ✅

Now that we have cleaned up the production database, we need to clone its schema, including tables, indexes, constraints, RLS policies, and functions to the test database.

1. **Generate Comprehensive Schema Copy Using pg_dump:** ✅

Instead of using a custom SQL script, we used PostgreSQL's native pg_dump tool which provides a more comprehensive and reliable export:

```bash
pg_dump -h db.[PRODUCTION-PROJECT-ID].supabase.co -p 5432 -d postgres -U postgres \
  --schema-only --no-owner --no-privileges \
  --exclude-schema="auth" --exclude-schema="storage" > migrations/schema_export.sql
```

This approach ensures we capture:
- Table definitions
- Primary keys and foreign keys
- Indexes
- RLS policies
- Functions and triggers
- Enums and custom types

2. **Apply the Schema to Test Database:** ✅

1. The schema was exported from the production database using pg_dump
2. The exported SQL was then applied to the test database using psql:

```bash
psql -h db.[TEST-PROJECT-ID].supabase.co -p 5432 -d postgres -U postgres -f migrations/schema_export.sql
```

3. **Schema Consistency Verified:** ✅

After applying the schema to the test database, we confirmed:
1. All application tables were successfully created
2. Constraints and indexes were properly applied
3. RLS policies were correctly implemented
4. Some expected errors occurred for Supabase system objects (which are automatically created and managed by Supabase)

### Phase 4: Testing Infrastructure Update (Week 3-4) 🔄

1. **Update Database Configuration Files:** ✅
   - Modified `.env.test` to point to the new test database:
   ```
   # Removed
   DATABASE_TABLE_PREFIX=test_
   
   # Added new test database connection
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[TEST-PROJECT-ID].supabase.co:5432/postgres
   ```

2. **Update Test Utilities and Database Integration:** 🔄
   - Created new test utilities for database setup and teardown
   - Implemented proper data seeding mechanisms
   - Created a consistent approach for test database management
   - While trying to run tests, we've encountered several issues:
     - TypeScript errors related to entity definitions
     - Missing dependencies in test modules
     - Test expectation failures due to schema changes
     - These will need to be addressed in the next step

3. **Fix Test Failures and Dependencies:** 🔄
   - Several test failures were identified related to:
     - Missing required fields in entity models (e.g., `store_id` in `RealTimeMetrics`)
     - Dependency injection issues in test modules
     - Schema changes affecting test expectations
   - These need to be fixed before tests can pass with the new database setup

4. **Testing Integration Checklist:**
   - [ ] Update entity model definitions to match new schema
   - [ ] Fix dependency injection in test modules
   - [ ] Update test expectations to match new schema
   - [ ] Create proper test seed data for required entities
   - [ ] Fix timing issues in tests (some tests show unresolved promises)

### Phase 5: CI/CD Update and Validation (Week 4)

1. **Update CI/CD pipeline:**
   - Configure GitHub Actions to use test database
   - Update workflows to use the new database connection

2. **Update testing utilities:**
   - Modify `TestDbUtils` class to work with the new approach:
   ```typescript
   // Before
   static getTestTables(): string[] {
     return [
       'orders',
       // ...other tables
     ].map(table => `${TEST_TABLE_PREFIX}${table}`);
   }
   
   // After
   static getTestTables(): string[] {
     return [
       'orders',
       // ...all other tables from our analysis
     ];
   }
   ```

3. **Create database seeding mechanism:**
   - Implement a proper seeding method that populates test data
   - Example:
   ```typescript
   export class TestDataSeeder {
     static async seedTestData(dataSource: DataSource): Promise<void> {
       // Seed store data
       await dataSource.getRepository(Store).save([
         { name: 'Test Store 1', status: 'active' },
         // more test data
       ]);
       
       // Seed other entities
       // ...
     }
   }
   ```

4. **Test the new setup:**
   - Run tests against the new test database
   - Verify all tests pass and data is properly isolated

5. **Remove legacy test tables from production:**
   - Once everything is migrated, run this SQL on the production database:
   ```sql
   DO $$ 
   DECLARE
       r RECORD;
   BEGIN
       FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'test_%')
       LOOP
           EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
       END LOOP;
   END $$;
   ```

6. **Documentation update:**
   - Update development documentation with new approach
   - Document step-by-step process for new developers

## Working with TypeORM and Supabase

### Key Considerations

1. **Supabase is PostgreSQL-based:**
   - TypeORM can generate PostgreSQL-compatible migrations
   - The SQL can be applied directly to Supabase

2. **Handling migrations:**
   - TypeORM typically runs migrations automatically 
   - With Supabase, we need to run the SQL manually through the SQL Editor
   - For production environments, use the migration tool in Supabase UI

3. **Data preservation:**
   - Migrations should be designed to preserve existing data
   - Use `ALTER TABLE` instead of dropping tables when possible
   - Add `IF NOT EXISTS` clauses to prevent errors

### Long-term Migration Strategy

For ongoing database changes:

1. **Create a migration script for each change:**
   ```typescript
   // backend/src/scripts/generate-migration.ts
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from '../app.module';
   import { getDataSourceToken } from '@nestjs/typeorm';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     const dataSource = app.get(getDataSourceToken());
     
     await dataSource.runMigrations();
     console.log('Migrations complete!');
     
     await app.close();
   }
   bootstrap();
   ```

2. **Track schema changes:**
   - Keep a record of all schema changes applied
   - Use version control for migration scripts

3. **Testing migrations:**
   - Always test migrations on the test database first
   - Create rollback plans for complex migrations

## Risk Analysis and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Data loss during migration | High | Low | Create backups before starting migration |
| Test failures after migration | Medium | Medium | Perform gradual migration with thorough testing |
| Development delays | Medium | Medium | Communicate clearly with the team and plan for buffer time |
| Schema drift between environments | High | Medium | Implement automated schema validation in CI/CD |
| Increased infrastructure costs | Low | High | Monitor costs and optimize resource allocation |

## Success Metrics

1. All integration tests pass with the new test database setup
2. No test tables remain in the production database
3. Development workflow is maintained or improved
4. Schema consistency between test and production environments
5. Test isolation is verified (tests don't affect production data)

## Future Considerations

1. **Staging Environment**: Consider adding a staging environment that mirrors production
2. **Database Migration Tool**: Implement more robust migration tools that work with Supabase
3. **Data Anonymization**: If using production data copies, implement anonymization for privacy
4. **Performance Testing**: Set up a dedicated database for performance testing with production-like volumes
5. **Monitoring**: Add monitoring to detect schema drift between environments 