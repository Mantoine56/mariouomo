# Monitoring Guide

This guide outlines the monitoring strategy for the Mario Uomo platform, covering metrics collection, alerting, and incident response procedures.

## Monitoring Architecture

```
                                    ┌─────────────┐
                                    │  New Relic  │
                                    │  (Metrics)  │
                                    └─────────────┘
                                          ▲
                                          │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sentry    │◄───│   Winston   │◄───│   Express   │◄───│    Redis    │
│  (Errors)   │    │   (Logs)    │    │  (Metrics)  │    │  (Cache)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                          │
                                          ▼
                                    ┌─────────────┐
                                    │ PostgreSQL  │
                                    │  (Stats)    │
                                    └─────────────┘
```

## Key Metrics

### 1. Application Performance

#### Response Time
```typescript
// Metric name: response_time
// Tags: endpoint, method, status_code
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1e6;
    newrelic.recordMetric('response_time', duration);
  });
  next();
});
```

#### Error Rate
```typescript
// Metric name: error_rate
// Tags: error_type, endpoint
app.use((err, req, res, next) => {
  newrelic.noticeError(err);
  next(err);
});
```

#### Request Rate
```typescript
// Metric name: request_rate
// Tags: endpoint, method
app.use((req, res, next) => {
  newrelic.incrementMetric('request_rate');
  next();
});
```

### 2. Database Performance

#### Connection Pool
```typescript
// Metric name: db_pool_size
// Tags: pool_name, database
pool.on('acquire', () => {
  newrelic.recordMetric('db_pool_active', pool.totalCount);
  newrelic.recordMetric('db_pool_waiting', pool.waitingCount);
});
```

#### Query Performance
```typescript
// Metric name: query_duration
// Tags: query_name, table
const trackQuery = async (query, params) => {
  const start = process.hrtime();
  try {
    return await pool.query(query, params);
  } finally {
    const [s, ns] = process.hrtime(start);
    newrelic.recordMetric('query_duration', s * 1000 + ns / 1e6);
  }
};
```

### 3. Cache Performance

#### Hit Rate
```typescript
// Metric name: cache_hit_rate
// Tags: cache_name
redis.on('hit', () => {
  newrelic.incrementMetric('cache_hits');
});
redis.on('miss', () => {
  newrelic.incrementMetric('cache_misses');
});
```

#### Memory Usage
```typescript
// Metric name: cache_memory_usage
// Tags: cache_name
setInterval(async () => {
  const info = await redis.info('memory');
  newrelic.recordMetric('cache_memory_usage', info.used_memory);
}, 60000);
```

## Alert Configuration

### 1. Critical Alerts

#### High Error Rate
```yaml
name: High Error Rate
condition:
  metric: error_rate
  threshold: 5%
  duration: 5m
response:
  priority: P1
  notification:
    - slack: #incidents
    - pagerduty: primary-oncall
```

#### Database Connection Issues
```yaml
name: Database Connection Issues
condition:
  metric: db_pool_waiting
  threshold: 5
  duration: 2m
response:
  priority: P1
  notification:
    - slack: #incidents
    - pagerduty: primary-oncall
```

#### High Response Time
```yaml
name: High Response Time
condition:
  metric: response_time
  threshold: 1000ms
  duration: 5m
response:
  priority: P2
  notification:
    - slack: #incidents
```

### 2. Warning Alerts

#### Cache Hit Rate Drop
```yaml
name: Low Cache Hit Rate
condition:
  metric: cache_hit_rate
  threshold: 80%
  duration: 15m
response:
  priority: P3
  notification:
    - slack: #warnings
```

#### High Memory Usage
```yaml
name: High Memory Usage
condition:
  metric: process_memory
  threshold: 80%
  duration: 10m
response:
  priority: P3
  notification:
    - slack: #warnings
```

## Dashboards

### 1. Overview Dashboard
```json
{
  "title": "System Overview",
  "refresh": "1m",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "metrics": ["request_rate"]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "metrics": ["error_rate"]
    },
    {
      "title": "Response Time",
      "type": "graph",
      "metrics": ["response_time"]
    }
  ]
}
```

### 2. Database Dashboard
```json
{
  "title": "Database Performance",
  "refresh": "1m",
  "panels": [
    {
      "title": "Active Connections",
      "type": "gauge",
      "metrics": ["db_pool_active"]
    },
    {
      "title": "Query Duration",
      "type": "heatmap",
      "metrics": ["query_duration"]
    }
  ]
}
```

## Logging Configuration

### 1. Winston Logger Setup
```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxFiles: '14d',
      maxsize: '20m'
    }),
    new winston.transports.File({
      filename: 'combined.log',
      maxFiles: '14d',
      maxsize: '20m'
    })
  ]
});
```

### 2. Log Levels
```typescript
const LogLevels = {
  error: 0,   // System errors, crashes
  warn: 1,    // Degraded service, recoverable errors
  info: 2,    // Important operations, state changes
  http: 3,    // HTTP request logging
  verbose: 4, // Detailed operational info
  debug: 5,   // Development debugging
  silly: 6    // Temporary debugging
};
```

## Incident Response

### 1. Severity Levels

#### P1 - Critical
- System outage
- Data loss
- Security breach
- Response time: 15 minutes

#### P2 - High
- Degraded service
- Performance issues
- Feature unavailability
- Response time: 30 minutes

#### P3 - Medium
- Minor functionality issues
- Non-critical bugs
- Warning thresholds
- Response time: 2 hours

#### P4 - Low
- UI/UX issues
- Enhancement requests
- Documentation updates
- Response time: 24 hours

### 2. Incident Response Process

1. **Detection**
   - Alert triggered
   - Manual report
   - Monitoring alert

2. **Assessment**
   - Determine severity
   - Identify impact
   - Assign resources

3. **Response**
   - Initial mitigation
   - Root cause analysis
   - Resolution plan

4. **Resolution**
   - Implement fix
   - Verify solution
   - Update documentation

5. **Review**
   - Post-mortem
   - Process improvement
   - Prevention measures

## Performance Optimization

### 1. Query Optimization
```sql
-- Monitor slow queries
SELECT 
  calls, 
  total_time / calls as avg_time,
  query
FROM pg_stat_statements
ORDER BY avg_time DESC
LIMIT 10;
```

### 2. Cache Optimization
```typescript
// Monitor cache effectiveness
const monitorCache = async () => {
  const stats = await redis.info('stats');
  const hitRate = stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses);
  newrelic.recordMetric('cache_effectiveness', hitRate);
};
```

## Security Monitoring

### 1. Authentication Monitoring
```typescript
// Track authentication attempts
app.use((req, res, next) => {
  if (req.path === '/auth/login') {
    newrelic.incrementMetric('auth_attempts', {
      success: res.statusCode === 200
    });
  }
  next();
});
```

### 2. Rate Limiting Monitoring
```typescript
// Track rate limit hits
app.use((req, res, next) => {
  if (res.statusCode === 429) {
    newrelic.incrementMetric('rate_limit_exceeded', {
      path: req.path
    });
  }
  next();
});
```

## Maintenance Procedures

### 1. Log Rotation
```bash
# Configure logrotate
/var/log/mario-uomo/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        /usr/bin/killall -HUP node
    endscript
}
```

### 2. Metric Cleanup
```typescript
// Cleanup old metrics
const cleanupMetrics = async () => {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 30);
  
  await Metric.destroy({
    where: {
      timestamp: {
        [Op.lt]: oldDate
      }
    }
  });
};
```

## Support Procedures

### 1. Monitoring Tools Access
- New Relic Dashboard
- Sentry Error Tracking
- Log Management System
- Database Monitoring

### 2. Support Contacts
- Primary On-Call: DevOps Team
- Secondary: Backend Team
- Escalation: Platform Team

### 3. Documentation
- System Architecture
- Alert Configurations
- Runbooks
- Escalation Procedures
