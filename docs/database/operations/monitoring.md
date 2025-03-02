# Database Monitoring

## Overview

This document outlines our database monitoring strategy, including key metrics, alerts, and troubleshooting procedures.

## Key Metrics

### Performance Metrics
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Connection utilization
SELECT count(*) * 100.0 / current_setting('max_connections')::float 
FROM pg_stat_activity;

-- Query performance
SELECT query, 
       calls, 
       total_time / calls as avg_time,
       rows / calls as avg_rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### Storage Metrics
```sql
-- Table sizes
SELECT relname as table_name,
       pg_size_pretty(pg_total_relation_size(relid)) as total_size,
       pg_size_pretty(pg_relation_size(relid)) as table_size,
       pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Cache Hit Ratios
```sql
-- Buffer cache hit ratio
SELECT 
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Index cache hit ratio
SELECT 
    sum(idx_blks_hit) / (sum(idx_blks_hit) + sum(idx_blks_read)) as index_hit_ratio
FROM pg_statio_user_tables;
```

## Alert Thresholds

### Critical Alerts
- Connection count > 80% of max_connections
- Query execution time > 30 seconds
- Storage usage > 85%
- Cache hit ratio < 90%
- Replication lag > 1 minute

### Warning Alerts
- Connection count > 60% of max_connections
- Query execution time > 10 seconds
- Storage usage > 75%
- Cache hit ratio < 95%
- Replication lag > 30 seconds

## Monitoring Tools

### Internal Tools
- Custom monitoring dashboard
- Alert management system
- Log aggregation

### External Services
- Supabase monitoring
- NewRelic integration
- Custom metrics collection

## Troubleshooting

### Common Issues
1. High CPU Usage
2. Slow Queries
3. Connection Pool Exhaustion
4. Storage Space Issues
5. Replication Delays

### Quick Fixes
```sql
-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '5 minutes';

-- Reset connection pools
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE usename = 'app_user';
```

## Maintenance Procedures

### Regular Maintenance
- Weekly VACUUM ANALYZE
- Monthly index maintenance
- Quarterly storage cleanup

### Emergency Procedures
- Connection pool reset
- Query cancellation
- Emergency vacuum
- Quick table optimization

## Additional Resources

- [Supabase Monitoring Guide](https://supabase.com/docs/guides/platform/monitoring)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Our Custom Monitoring Tools](./monitoring-tools.md)
