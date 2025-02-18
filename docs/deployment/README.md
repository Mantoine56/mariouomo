# Mario Uomo Deployment Guide

This guide provides detailed instructions for deploying the Mario Uomo e-commerce platform. The platform consists of a NestJS backend and a Next.js frontend, with additional services for caching and monitoring.

## Architecture Overview

```
                                    ┌─────────────┐
                                    │   Vercel    │
                                    │  (Frontend) │
                                    └─────────────┘
                                          ▲
                                          │
                                          ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   New Relic  │◄───│   Heroku    │◄───│    Redis    │
│ (Monitoring) │    │  (Backend)  │    │  (Upstash)  │
└─────────────┘    └─────────────┘    └─────────────┘
                          ▲
                          │
                          ▼
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │ (Supabase)  │
                    └─────────────┘
```

## Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Git
- Heroku CLI
- Vercel CLI
- Access to:
  - Heroku account
  - Vercel account
  - Supabase project
  - Upstash account
  - New Relic account

## Environment Setup

### Backend (.env)
```env
# Node
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://user:password@host:port

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000
DB_POOL_REAP_INTERVAL=1000

# Monitoring
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=mario-uomo-backend
NEW_RELIC_LOG_LEVEL=info

# Logging
LOG_LEVEL=info
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m

# Cache
CACHE_PRODUCTS_MAX_AGE=300
CACHE_CATEGORIES_MAX_AGE=600
CACHE_DEFAULT_MAX_AGE=60
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://api.mariouomo.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Deployment Steps

### 1. Backend Deployment (Heroku)

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create mario-uomo-backend
   ```

3. **Configure Buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=your-database-url
   # Set all other environment variables
   ```

5. **Configure Add-ons**
   ```bash
   heroku addons:create newrelic:wayne
   heroku addons:create scheduler:standard
   ```

6. **Deploy Backend**
   ```bash
   git push heroku main
   ```

7. **Scale Dynos**
   ```bash
   heroku ps:scale web=2:Standard-2X
   ```

### 2. Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   pnpm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Project**
   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_SENTRY_DSN
   ```

5. **Deploy Frontend**
   ```bash
   vercel --prod
   ```

### 3. Database Setup (Supabase)

1. **Create Database**
   - Log into Supabase dashboard
   - Create new project
   - Note connection details

2. **Run Migrations**
   ```bash
   cd backend
   pnpm typeorm migration:run
   ```

3. **Configure Connection Pool**
   - Set pool configuration in database settings
   - Configure SSL settings

### 4. Redis Setup (Upstash)

1. **Create Redis Database**
   - Log into Upstash dashboard
   - Create new database
   - Note connection URL

2. **Configure Redis**
   - Set maxmemory policy to allkeys-lru
   - Enable persistence
   - Configure SSL/TLS

### 5. Monitoring Setup

1. **New Relic Configuration**
   - Install New Relic agent
   - Configure alerts and dashboards
   - Set up custom metrics

2. **Logging Setup**
   - Configure log rotation
   - Set up log forwarding
   - Configure alert thresholds

## Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://api.mariouomo.com/health
   ```

2. **Database Connection**
   ```bash
   heroku pg:info
   ```

3. **Redis Connection**
   ```bash
   heroku run redis-cli -u $REDIS_URL ping
   ```

4. **Monitor Logs**
   ```bash
   heroku logs --tail
   ```

## Rollback Procedures

### Backend Rollback
```bash
heroku rollback v<previous-version>
```

### Frontend Rollback
```bash
vercel rollback
```

### Database Rollback
```bash
pnpm typeorm migration:revert
```

## Maintenance Procedures

### Database Maintenance
1. **Vacuum Analysis**
   ```bash
   heroku pg:vacuum-stats
   ```

2. **Index Maintenance**
   ```bash
   heroku pg:maintenance:run
   ```

### Redis Maintenance
1. **Monitor Memory**
   ```bash
   redis-cli -u $REDIS_URL info memory
   ```

2. **Clear Cache**
   ```bash
   redis-cli -u $REDIS_URL FLUSHDB
   ```

## Troubleshooting

### Common Issues

1. **Connection Pool Exhaustion**
   - Check active connections
   - Verify pool configuration
   - Monitor connection metrics

2. **Redis Memory Issues**
   - Check memory usage
   - Verify maxmemory policy
   - Monitor eviction rate

3. **Performance Issues**
   - Check New Relic metrics
   - Verify cache hit rates
   - Monitor database queries

## Security Considerations

1. **SSL/TLS Configuration**
   - Enable SSL for all connections
   - Configure SSL certificates
   - Set up automatic renewal

2. **Environment Variables**
   - Use secure environment variables
   - Rotate secrets regularly
   - Monitor access logs

3. **Access Control**
   - Configure CORS properly
   - Set up IP restrictions
   - Monitor authentication attempts

## Monitoring and Alerts

1. **Set Up Alerts**
   - CPU usage > 70%
   - Memory usage > 80%
   - Error rate > 1%
   - Response time > 500ms

2. **Configure Dashboards**
   - Request rate
   - Error rate
   - Response time
   - Cache hit rate
   - Database connections

## Backup and Recovery

1. **Database Backups**
   ```bash
   # Manual backup
   heroku pg:backups:capture
   
   # Download backup
   heroku pg:backups:download
   ```

2. **Redis Backups**
   - Enable AOF persistence
   - Configure RDB snapshots
   - Set up backup schedule

## Support and Escalation

1. **First Level Support**
   - Check logs and metrics
   - Basic troubleshooting
   - Monitor system health

2. **Second Level Support**
   - Performance optimization
   - Advanced debugging
   - Security incidents

3. **Emergency Contacts**
   - On-call rotation
   - Escalation procedures
   - Incident response team
