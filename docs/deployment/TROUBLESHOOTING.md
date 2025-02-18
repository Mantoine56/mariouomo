# Troubleshooting Guide

This guide helps diagnose and resolve common issues in the Mario Uomo platform.

## Quick Diagnostic Commands

```bash
# Check backend status
curl -v https://api.mariouomo.com/health

# Check database connections
heroku pg:info
heroku pg:diagnose

# Check Redis status
heroku run redis-cli -u $REDIS_URL info

# View logs
heroku logs --tail
```

## Common Issues

### 1. Connection Pool Exhaustion

**Symptoms:**
- Slow response times
- Database connection errors
- `TimeoutError` in logs

**Diagnosis:**
```bash
# Check active connections
heroku pg:ps

# View connection metrics
heroku pg:info
```

**Solutions:**
1. Increase pool size:
   ```typescript
   // database.config.ts
   poolConfig: {
     min: 5,    // Increase minimum connections
     max: 20    // Increase maximum connections
   }
   ```

2. Optimize query patterns:
   - Use connection pooling properly
   - Release connections promptly
   - Implement proper error handling

### 2. Redis Memory Issues

**Symptoms:**
- Cache misses
- High memory usage
- Eviction notices in logs

**Diagnosis:**
```bash
# Check memory usage
redis-cli -u $REDIS_URL info memory

# Monitor evictions
redis-cli -u $REDIS_URL info stats | grep evicted
```

**Solutions:**
1. Adjust memory policy:
   ```bash
   # Set maxmemory policy
   redis-cli -u $REDIS_URL CONFIG SET maxmemory-policy allkeys-lru
   ```

2. Optimize cache usage:
   - Set appropriate TTLs
   - Implement cache size limits
   - Monitor cache hit rates

### 3. High CPU Usage

**Symptoms:**
- Slow response times
- High resource utilization
- Throttling warnings

**Diagnosis:**
```bash
# Check dyno metrics
heroku metrics:web

# View process status
heroku ps
```

**Solutions:**
1. Scale resources:
   ```bash
   # Scale dynos
   heroku ps:scale web=2:Standard-2X
   ```

2. Optimize performance:
   - Implement caching
   - Optimize database queries
   - Use proper indexing

### 4. Memory Leaks

**Symptoms:**
- Increasing memory usage
- Periodic crashes
- Out of memory errors

**Diagnosis:**
```bash
# Check memory metrics
heroku metrics:web --json

# Generate heap dump
heroku run node --heapsnapshot
```

**Solutions:**
1. Fix memory leaks:
   - Check for unclosed connections
   - Verify proper resource cleanup
   - Monitor memory usage patterns

2. Implement safeguards:
   - Set memory limits
   - Implement automatic restart
   - Add monitoring alerts

### 5. Slow Queries

**Symptoms:**
- Long response times
- Database timeouts
- High CPU usage

**Diagnosis:**
```bash
# Check slow queries
heroku pg:outliers

# Analyze query plans
heroku pg:query-plans
```

**Solutions:**
1. Optimize queries:
   - Add proper indexes
   - Rewrite inefficient queries
   - Implement query caching

2. Monitor performance:
   - Set up query logging
   - Monitor execution times
   - Track query patterns

## Emergency Procedures

### 1. Service Outage

1. **Check Status:**
   ```bash
   # Check application status
   heroku ps
   heroku status
   ```

2. **View Logs:**
   ```bash
   heroku logs --tail
   ```

3. **Emergency Restart:**
   ```bash
   heroku restart
   ```

### 2. Database Issues

1. **Check Database:**
   ```bash
   heroku pg:info
   heroku pg:diagnose
   ```

2. **Emergency Recovery:**
   ```bash
   # Restore from backup
   heroku pg:backups:restore
   ```

### 3. Cache Failure

1. **Check Redis:**
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

2. **Emergency Reset:**
   ```bash
   redis-cli -u $REDIS_URL FLUSHALL
   ```

## Performance Optimization

### 1. Database Optimization

```bash
# Analyze tables
heroku pg:vacuum-stats

# Update statistics
heroku pg:maintenance:run
```

### 2. Cache Optimization

```bash
# Monitor cache hits
redis-cli -u $REDIS_URL info stats

# Check memory usage
redis-cli -u $REDIS_URL info memory
```

### 3. Application Optimization

```bash
# Monitor response times
heroku logs --tail | grep "response-time"

# Check dyno usage
heroku ps:utilization
```

## Support Resources

1. **Documentation:**
   - [Deployment Guide](./README.md)
   - [API Documentation](../api/README.md)
   - [Architecture Overview](../architecture/README.md)

2. **Monitoring:**
   - New Relic Dashboard
   - Heroku Metrics
   - Custom Alerts

3. **Support Channels:**
   - Development Team
   - DevOps Team
   - Emergency Contact
