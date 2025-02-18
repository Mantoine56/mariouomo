# Troubleshooting Guide

This guide provides comprehensive troubleshooting procedures for common issues in the Mario Uomo platform.

## Quick Reference

### Diagnostic Commands

```bash
# System Health
curl https://api.mariouomo.com/health

# Application Logs
heroku logs --tail

# Database Status
heroku pg:info
heroku pg:diagnose

# Redis Status
heroku redis:info
redis-cli -u $REDIS_URL info

# Process Status
heroku ps
heroku ps:metrics
```

## Common Issues

### 1. Application Not Starting

#### Symptoms
- Application fails to start
- Heroku deployment fails
- Local development server crashes

#### Diagnosis
```bash
# Check application logs
heroku logs --tail

# Check process status
heroku ps

# Check local logs
pnpm dev --verbose
```

#### Solutions

1. **Environment Variables Missing**
   ```bash
   # Check environment variables
   heroku config
   
   # Set missing variables
   heroku config:set KEY=value
   ```

2. **Dependencies Issues**
   ```bash
   # Clear dependency cache
   rm -rf node_modules
   pnpm store prune
   
   # Reinstall dependencies
   pnpm install
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   
   # Kill process using port
   kill -9 $(lsof -t -i:3000)
   ```

### 2. Database Connection Issues

#### Symptoms
- Connection timeout errors
- Pool exhaustion warnings
- Slow query responses

#### Diagnosis
```bash
# Check database status
heroku pg:info

# View active connections
heroku pg:ps

# Check connection pool
heroku pg:diagnose
```

#### Solutions

1. **Connection Pool Exhaustion**
   ```typescript
   // Adjust pool configuration
   const poolConfig = {
     min: 2,
     max: 10,
     idleTimeoutMillis: 30000,
     acquireTimeoutMillis: 60000
   };
   ```

2. **Slow Queries**
   ```sql
   -- Identify slow queries
   SELECT 
     calls,
     total_time / calls as avg_time,
     query
   FROM pg_stat_statements
   ORDER BY avg_time DESC
   LIMIT 10;
   
   -- Add missing indexes
   CREATE INDEX idx_product_category ON products(category_id);
   ```

3. **Connection Leaks**
   ```typescript
   // Implement proper connection release
   try {
     const client = await pool.connect();
     try {
       return await client.query(sql, params);
     } finally {
       client.release();
     }
   } catch (error) {
     logger.error('Database error:', error);
     throw error;
   }
   ```

### 3. Cache Performance Issues

#### Symptoms
- High cache miss rate
- Increased response times
- Memory usage warnings

#### Diagnosis
```bash
# Check Redis status
redis-cli -u $REDIS_URL info

# Monitor cache hits/misses
redis-cli -u $REDIS_URL info stats

# Check memory usage
redis-cli -u $REDIS_URL info memory
```

#### Solutions

1. **High Miss Rate**
   ```typescript
   // Implement proper cache strategy
   const cacheConfig = {
     products: {
       ttl: 300,  // 5 minutes
       prefix: 'prod:'
     },
     categories: {
       ttl: 3600,  // 1 hour
       prefix: 'cat:'
     }
   };
   ```

2. **Memory Issues**
   ```bash
   # Set memory limit
   redis-cli -u $REDIS_URL CONFIG SET maxmemory 2gb
   
   # Set eviction policy
   redis-cli -u $REDIS_URL CONFIG SET maxmemory-policy allkeys-lru
   ```

3. **Cache Invalidation**
   ```typescript
   // Implement cache invalidation
   const invalidateCache = async (pattern: string) => {
     const keys = await redis.keys(pattern);
     if (keys.length > 0) {
       await redis.del(...keys);
     }
   };
   ```

### 4. Performance Issues

#### Symptoms
- High response times
- CPU/Memory warnings
- Request timeouts

#### Diagnosis
```bash
# Check system metrics
heroku ps:metrics

# Monitor response times
curl -w "\nTime: %{time_total}s\n" https://api.mariouomo.com/health

# Check resource usage
heroku ps:utilization
```

#### Solutions

1. **High CPU Usage**
   ```typescript
   // Implement request queuing
   const queue = new Queue('requests', {
     limiter: {
       max: 1000,
       duration: 1000
     }
   });
   ```

2. **Memory Leaks**
   ```typescript
   // Monitor memory usage
   const monitor = () => {
     const used = process.memoryUsage();
     logger.info('Memory usage:', {
       heapTotal: used.heapTotal / 1024 / 1024,
       heapUsed: used.heapUsed / 1024 / 1024
     });
   };
   ```

3. **Slow Endpoints**
   ```typescript
   // Implement caching for expensive operations
   const getProducts = async () => {
     const cacheKey = 'products:all';
     const cached = await redis.get(cacheKey);
     
     if (cached) {
       return JSON.parse(cached);
     }
     
     const products = await db.query('SELECT * FROM products');
     await redis.set(cacheKey, JSON.stringify(products), 'EX', 300);
     return products;
   };
   ```

### 5. Authentication Issues

#### Symptoms
- Login failures
- Token validation errors
- Session expiration

#### Diagnosis
```bash
# Check auth logs
heroku logs --tail | grep auth

# Monitor failed attempts
heroku logs --tail | grep "Authentication failed"
```

#### Solutions

1. **Token Issues**
   ```typescript
   // Implement token refresh
   const refreshToken = async (token: string) => {
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const newToken = jwt.sign(
         { userId: decoded.userId },
         process.env.JWT_SECRET,
         { expiresIn: '1h' }
       );
       return newToken;
     } catch (error) {
       throw new UnauthorizedException('Invalid token');
     }
   };
   ```

2. **Session Management**
   ```typescript
   // Implement session cleanup
   const cleanupSessions = async () => {
     const expiredSessions = await Session.find({
       expiresAt: { $lt: new Date() }
     });
     await Session.deleteMany({
       _id: { $in: expiredSessions.map(s => s._id) }
     });
   };
   ```

## Development Issues

### 1. Build Failures

#### Symptoms
- TypeScript compilation errors
- Webpack build failures
- Dependency conflicts

#### Solutions
```bash
# Clear build cache
rm -rf dist
rm -rf .next

# Update TypeScript
pnpm update typescript @types/node

# Check for type errors
pnpm tsc --noEmit
```

### 2. Test Failures

#### Symptoms
- Unit test failures
- Integration test timeouts
- Coverage issues

#### Solutions
```bash
# Run specific tests
pnpm test:unit
pnpm test:integration

# Update snapshots
pnpm test -u

# Check coverage
pnpm test --coverage
```

## Production Issues

### 1. Deployment Failures

#### Symptoms
- Failed Heroku builds
- Post-deployment crashes
- Configuration issues

#### Solutions
```bash
# Check build logs
heroku builds:info

# Roll back deployment
heroku rollback

# Check configuration
heroku config
```

### 2. Scaling Issues

#### Symptoms
- High resource usage
- Request queuing
- Timeout errors

#### Solutions
```bash
# Scale dynos
heroku ps:scale web=2:Standard-2X

# Enable auto-scaling
heroku config:set MIN_DYNOS=2 MAX_DYNOS=4

# Monitor scaling
heroku ps:utilization
```

## Support Resources

### 1. Monitoring Tools
- New Relic Dashboard
- Sentry Error Tracking
- Log Management System

### 2. Documentation
- [API Documentation](../api/README.md)
- [Deployment Guide](../deployment/README.md)
- [Monitoring Guide](../monitoring/README.md)

### 3. Support Channels
- Development Team: dev@mariouomo.com
- DevOps Team: devops@mariouomo.com
- Emergency: emergency@mariouomo.com
