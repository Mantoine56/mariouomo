# Backup and Recovery Procedures

## Backup Strategy

### Automated Backups (Supabase)
- **Type**: Automated daily backups via Supabase
- **Method**: 
  - For DB < 15GB: Logical backups using pg_dumpall
  - For DB > 15GB: Physical backups
- **Retention Period**: Based on plan level (7-30 days)
- **Backup Time**: Daily at 00:00 UTC
- **Included**: Database structure, data, roles, and permissions
- **Excluded**: 
  - Custom role passwords
  - Storage objects (handled separately)
  - Realtime subscriptions

### Additional Custom Backups
- **Frequency**: Weekly
- **Method**: pg_dump with custom format
- **Retention**: 90 days
- **Storage**: Encrypted S3 bucket

```bash
# Weekly backup script (store as backup_db.sh)
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.erxqwxyhulnycscgbzlm.supabase.co:5432/postgres"

# Create backup
pg_dump -Fc "${DB_URL}" > "${BACKUP_DIR}/backup_${TIMESTAMP}.dump"

# Encrypt backup
gpg --encrypt --recipient your-gpg-key "${BACKUP_DIR}/backup_${TIMESTAMP}.dump"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/backup_${TIMESTAMP}.dump.gpg" "s3://your-bucket/backups/"

# Clean old backups (keep last 90 days)
find "${BACKUP_DIR}" -type f -mtime +90 -delete
```

## Verification Procedures

### Daily Backup Verification
```sql
-- Create verification function
CREATE OR REPLACE FUNCTION verify_backup_integrity()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    last_updated timestamp,
    has_valid_constraints boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::text,
        (SELECT count(*) FROM information_schema.tables WHERE table_name = t.table_name)::bigint,
        (SELECT max(updated_at) FROM information_schema.tables WHERE table_name = t.table_name)::timestamp,
        (SELECT bool_and(convalidated) FROM pg_constraint WHERE conrelid = t.table_name::regclass)
    FROM (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    ) t;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM verify_backup_integrity();
```

## Recovery Procedures

### Standard Recovery (Supabase Dashboard)
1. Access the Supabase Dashboard
2. Navigate to Database → Backups → Scheduled backups
3. Select the desired backup point
4. Confirm restoration (note: project will be temporarily inaccessible)
5. Wait for restoration to complete
6. Verify data integrity

### Custom Backup Recovery
```bash
# Restore from custom backup
#!/bin/bash
BACKUP_FILE=$1
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.erxqwxyhulnycscgbzlm.supabase.co:5432/postgres"

# Decrypt backup
gpg --decrypt "${BACKUP_FILE}" > "${BACKUP_FILE%.gpg}"

# Restore database
pg_restore -d "${DB_URL}" --clean --if-exists "${BACKUP_FILE%.gpg}"
```

### Post-Recovery Tasks
1. Reset custom role passwords:
```sql
ALTER ROLE custom_role WITH PASSWORD 'new_password';
```

2. Recreate subscriptions:
```sql
SELECT pg_create_subscription(
    'subscription_name',
    'connection_string',
    '{table1, table2}'
);
```

3. Verify data integrity:
```sql
-- Check table row counts
SELECT schemaname, relname, n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

-- Verify materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY order_daily_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;

-- Check for invalid indexes
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND idx_tup_read = 0;
```

## Disaster Recovery Plan

### Severity Levels
- **Level 1**: Minor data inconsistency (few records)
- **Level 2**: Significant data loss but system operational
- **Level 3**: Complete system failure

### Recovery Time Objectives (RTO)
- Level 1: 1 hour
- Level 2: 4 hours
- Level 3: 8 hours

### Recovery Point Objectives (RPO)
- Maximum data loss tolerance: 24 hours

### Emergency Response Checklist
1. [ ] Identify and document the issue
2. [ ] Determine severity level
3. [ ] Notify stakeholders (use contact list below)
4. [ ] Execute appropriate recovery procedure
5. [ ] Verify system functionality
6. [ ] Document incident and resolution
7. [ ] Conduct post-mortem analysis

### Emergency Contacts
- **Primary DBA**: [Name] - [Contact]
- **Backup DBA**: [Name] - [Contact]
- **Supabase Support**: https://supabase.com/support
- **Status Page**: https://status.supabase.com/

## Monitoring and Alerting

### Connection Monitoring
```sql
-- Monitor active connections
SELECT * FROM pg_stat_activity 
WHERE state = 'active';

-- Check connection limits
SELECT COUNT(*), usename, client_addr 
FROM pg_stat_activity 
GROUP BY usename, client_addr;
```

### Performance Monitoring
```sql
-- Check table bloat
SELECT
    schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_table_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### Regular Maintenance Tasks
1. Weekly:
   - Analyze all tables
   - Update statistics
   - Check for bloat
2. Monthly:
   - Test backup restoration
   - Review access logs
   - Update documentation

## Compliance and Auditing
- Maintain backup logs for 1 year
- Document all recovery operations
- Regular testing of recovery procedures
- Annual review of backup strategy
