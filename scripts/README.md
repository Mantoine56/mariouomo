# Database Migration Scripts

This directory contains SQL scripts for database migration and cleanup as part of the test database separation project.

## Script Overview

### `create_missing_tables.sql`

This script creates the missing core tables in the production database:
- `addresses`
- `categories`
- `categories_closure`
- `product_categories`

Each table is created with appropriate constraints, primary keys, foreign keys, and indexes.

**Usage:**
1. Log into the Supabase dashboard for the production database
2. Go to the SQL Editor
3. Paste the contents of this file
4. Execute the script
5. Verify the tables have been created correctly

### `drop_test_tables.sql`

This script removes all test tables from the production database after verifying that the proper tables have been created and any necessary data has been migrated.

**Usage:**
1. Ensure you have created and verified the proper tables first
2. Log into the Supabase dashboard for the production database
3. Go to the SQL Editor
4. Paste the contents of this file
5. Execute the script
6. The script will verify all test tables have been dropped successfully

### `verify_constraints.sql`

This script checks that all necessary constraints exist on our newly created core tables.

**Usage:**
1. After running the `create_missing_tables.sql` script
2. Log into the Supabase dashboard for the production database
3. Go to the SQL Editor
4. Paste the contents of this file
5. Execute the script
6. Check the results to ensure all constraints are marked as 'EXISTS'

### `export_full_schema.sql`

This script exports the complete database schema from the production database, including tables, constraints, indexes, RLS policies, functions, and custom types. The output SQL can be executed on the test database to recreate the exact same schema.

**Usage:**
1. After cleaning up the production database
2. Log into the Supabase dashboard for the production database
3. Go to the SQL Editor
4. Paste the contents of this file
5. Execute the script
6. Copy the generated SQL output
7. Log into the test database's Supabase dashboard
8. Go to the SQL Editor
9. Paste the copied SQL
10. Execute the script to recreate the schema in the test database
11. Verify all database objects were created correctly

## Migration Process

Follow this process to clean up the production database and prepare for test database creation:

1. Run `create_missing_tables.sql` to create missing core tables
2. Run `verify_constraints.sql` to ensure all tables have proper constraints
3. Verify the application works with the new tables
4. Run `drop_test_tables.sql` to remove all test tables
5. Run `export_full_schema.sql` to export the complete schema
6. Import the exported schema to the test database

After completing these steps, both the production and test databases will have identical schemas, ready for the application to use. 