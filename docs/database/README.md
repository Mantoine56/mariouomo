# Database Documentation

## Overview

The Mario Uomo e-commerce platform uses PostgreSQL via Supabase as its primary database. This documentation provides comprehensive information about our database architecture, schema, security policies, and maintenance procedures.

## Implementation Status
Last Updated: 2025-03-06

### Completed Tasks
- Initial documentation and planning
- SQL script preparation
- Schema definition
- RLS policies definition
- Supabase Project Configuration
  - Project setup and admin access
  - Required extensions enabled
  - Connection pooling configured
  - Automated backups enabled
- Schema Implementation
  - Tables created and verified
  - RLS enabled
  - Security policies implemented
  - Performance indexes created
  - Audit logging configured
- Backup and recovery procedures
  - Automated daily Supabase backups
  - Custom weekly backup script
  - Backup verification tools
- Schema Updates (March 2025)
  - Profiles table enhancements
  - Inventory items table enhancements
  - Backward compatibility implementation
  - Data migration scripts

## Table of Contents

1. [Schema](./schema/README.md)
   - [Table Definitions](./schema/tables.md)
   - [Relationships](./schema/relationships.md)
   - [Database Diagram](./schema/diagram.md)

2. [Security](./security/rls-policies.md)
   - Row Level Security (RLS) Policies
   - Authentication Rules
   - Multi-store Isolation

3. [Operations](./operations/)
   - [Backup & Recovery](./operations/backup-recovery.md)
   - [Monitoring](./operations/monitoring.md)

4. [Migrations](./migrations/guide.md)
   - Migration Procedures
   - Version Control
   - Testing Guidelines

## Quick Links

- [Schema Overview](./schema/README.md)
- [Security Policies](./security/rls-policies.md)
- [Backup Procedures](./operations/backup-recovery.md)
- [Monitoring Guide](./operations/monitoring.md)
- [Migration Guide](./migrations/guide.md)
- [March 2025 Schema Updates](./migrations/march-2025-schema-updates.md)

## Development Guidelines

### Database Conventions
- Use snake_case for table and column names
- Include created_at and updated_at timestamps
- Implement proper foreign key constraints
- Enable RLS on all tables
- Document all custom types and enums

### Performance Best Practices
- Create appropriate indexes
- Use materialized views for reports
- Implement efficient pagination
- Monitor query performance

### Security Requirements
- All tables must have RLS policies
- Use parameterized queries only
- Never store sensitive data in plain text
- Implement proper backup procedures

## Contact

For database-related questions or issues:
1. Check the documentation
2. Review migration history
3. Contact the database team
4. Create an issue in our repository
