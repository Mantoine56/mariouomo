# Quick Reference Guide

## Common Issues and Solutions

### Application Issues

1. **App Won't Start**
   ```bash
   # Check logs
   heroku logs --tail
   
   # Restart app
   heroku restart
   ```

2. **High Error Rate**
   ```bash
   # Check error logs
   heroku logs --tail | grep ERROR
   
   # Monitor health
   curl https://api.mariouomo.com/health
   ```

### Database Issues

1. **Connection Failures**
   ```bash
   # Check status
   heroku pg:info
   
   # Reset connections
   heroku pg:kill all
   ```

2. **Slow Queries**
   ```bash
   # Check slow queries
   heroku pg:outliers
   ```

### Cache Issues

1. **Redis Connection**
   ```bash
   # Check status
   redis-cli -u $REDIS_URL ping
   
   # Clear cache
   redis-cli -u $REDIS_URL FLUSHDB
   ```

2. **Memory Issues**
   ```bash
   # Check memory
   redis-cli -u $REDIS_URL info memory
   ```

### Performance Issues

1. **High CPU**
   ```bash
   # Check metrics
   heroku ps:metrics
   
   # Scale up
   heroku ps:scale web=2:Standard-2X
   ```

2. **Memory Leaks**
   ```bash
   # Check memory
   heroku ps:utilization
   ```

## Diagnostic Commands

### System Health
```bash
# Overall health
curl https://api.mariouomo.com/health

# Process status
heroku ps
heroku ps:metrics
```

### Database
```bash
# Connection info
heroku pg:info

# Active queries
heroku pg:ps

# Locks
heroku pg:locks
```

### Cache
```bash
# Redis info
heroku redis:info

# Cache stats
redis-cli -u $REDIS_URL info stats
```

### Logs
```bash
# All logs
heroku logs --tail

# Error logs
heroku logs --tail | grep ERROR

# Slow queries
heroku logs --tail | grep "slow query"
```

## Emergency Procedures

### 1. Service Outage
```bash
# Check status
heroku status

# Restart app
heroku restart

# Roll back
heroku rollback v<previous-version>
```

### 2. Data Issues
```bash
# Backup database
heroku pg:backups:capture

# Restore backup
heroku pg:backups:restore
```

### 3. Security Incident
```bash
# Rotate credentials
heroku config:set JWT_SECRET=new_secret

# Enable maintenance mode
heroku maintenance:on
```

## Support Contacts

- **Development:** dev@mariouomo.com
- **DevOps:** devops@mariouomo.com
- **Emergency:** emergency@mariouomo.com
