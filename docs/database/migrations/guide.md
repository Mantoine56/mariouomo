# Database Migration Guide

## Overview

This guide outlines our database migration procedures, including both schema changes and data migrations.

## Migration Types

### Schema Migrations
- Table creation/modification
- Index management
- Constraint changes
- RLS policy updates

### Data Migrations
- Data transformations
- Backfills
- Clean-up operations

## Migration Process

### 1. Development
```bash
# Create new migration
pnpm run migration:create "description"

# Apply migrations locally
pnpm run migration:up

# Revert last migration
pnpm run migration:down
```

### 2. Testing
- Test on development database
- Verify data integrity
- Check performance impact
- Validate RLS policies

### 3. Staging Deployment
```bash
# Deploy to staging
pnpm run migration:up --env staging

# Verify changes
pnpm run migration:status
```

### 4. Production Deployment
```bash
# Deploy to production
pnpm run migration:up --env production

# Verify deployment
pnpm run migration:status
```

## Best Practices

### Writing Migrations
- Make migrations reversible
- Include up/down scripts
- Test both directions
- Document changes

### Safety Checks
- Backup before migration
- Check table sizes
- Monitor locks
- Have rollback plan

## Migration Files

### Structure
```sql
-- Up Migration
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Down Migration
DROP TABLE example;
```

### Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

## Recent Migrations

### March 2025 Schema Updates
A significant schema update was performed in March 2025 to align the database structure with entity definitions in the backend code. This migration focused on backward compatibility while adding new functionality.

- [Full Documentation](./march-2025-schema-updates.md)
- [SQL Scripts](../../db-scripts/)

Key changes included:
- Adding missing columns to the `profiles` table
- Enhancing the `inventory_items` table with additional fields
- Implementing data migration for existing records
- Supporting both legacy and new column names during transition

## Common Issues

### Troubleshooting
- Lock conflicts
- Long-running migrations
- Failed rollbacks
- Data inconsistencies

### Solutions
- Use batching for large data changes
- Implement proper error handling and rollback mechanisms
- Test migrations thoroughly before production deployment
- Implement retry logic
- Monitor progress
- Validate results

## Tools & Scripts

### Migration CLI
```bash
# List migrations
pnpm run migration:list

# Check status
pnpm run migration:status

# Generate new migration
pnpm run migration:create
```

### Validation Scripts
```bash
# Verify data integrity
pnpm run migration:verify

# Check constraints
pnpm run migration:check
```
