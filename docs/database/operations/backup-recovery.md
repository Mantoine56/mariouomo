# Database Backup & Recovery

## Overview

This document outlines our database backup and recovery procedures for the Mario Uomo e-commerce platform. We use Supabase's built-in backup features along with our custom backup solutions for additional security.

## Backup Types

### Automated Backups

#### Supabase Daily Backups
- Frequency: Daily
- Retention: 7 days
- Type: Full database backup
- Location: Supabase secure storage

#### Custom Point-in-Time Backups
- Frequency: Every 6 hours
- Retention: 30 days
- Type: Incremental
- Location: Secure cloud storage

### Manual Backups

#### Pre-deployment Backups
```bash
# Run before major deployments
./scripts/backup_db.sh pre-deploy
```

#### On-demand Backups
```bash
# Run for specific backup needs
./scripts/backup_db.sh manual "backup-reason"
```

## Backup Verification

### Automated Verification
- Integrity checks after each backup
- Test restores on staging environment
- Data consistency validation

### Manual Verification
```bash
# Verify backup integrity
./scripts/verify_backup.sh [backup-file]

# Test restore on staging
./scripts/test_restore.sh [backup-file]
```

## Recovery Procedures

### Full Database Recovery
```bash
# 1. Stop application servers
./scripts/maintenance_mode.sh on

# 2. Restore from backup
./scripts/restore_db.sh [backup-file]

# 3. Verify data integrity
./scripts/verify_data.sh

# 4. Resume operations
./scripts/maintenance_mode.sh off
```

### Point-in-Time Recovery
```bash
# Restore to specific timestamp
./scripts/pitr_restore.sh "2025-02-23 10:00:00"
```

## Monitoring & Alerts

### Backup Monitoring
- Backup success/failure alerts
- Storage space monitoring
- Backup integrity checks

### Recovery Testing
- Monthly recovery drills
- Documentation updates
- Team training

## Emergency Contacts

For backup/recovery emergencies:
1. Database Administrator (24/7)
2. DevOps Team Lead
3. CTO

## Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [Internal Backup Procedures](./internal-backup-procedures.md)
- [Recovery Playbooks](./recovery-playbooks.md)
