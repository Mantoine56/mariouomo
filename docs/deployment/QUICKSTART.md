# Quick Start Deployment Guide

This guide provides the essential steps to get the Mario Uomo platform running in production. For detailed instructions, see the full [Deployment Guide](./README.md).

## Prerequisites

```bash
# Check Node.js version
node --version  # Should be ≥ 18.x

# Install pnpm
npm install -g pnpm

# Install CLIs
npm install -g vercel heroku
```

## Backend Deployment

```bash
# Login to Heroku
heroku login

# Create and configure app
heroku create mario-uomo-backend
heroku buildpacks:set heroku/nodejs

# Set core environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your-database-url
heroku config:set REDIS_URL=your-redis-url
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main

# Scale
heroku ps:scale web=2:Standard-2X
```

## Frontend Deployment

```bash
# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

## Verify Deployment

```bash
# Check backend health
curl https://your-backend-url/health

# Check frontend
open https://your-frontend-url

# Monitor logs
heroku logs --tail
```

## Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   heroku pg:info
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis connection
   heroku run redis-cli -u $REDIS_URL ping
   ```

3. **High Memory Usage**
   ```bash
   # Check dyno metrics
   heroku metrics:web
   ```

## Need Help?

- Check the full [Deployment Guide](./README.md)
- Review [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Contact support team
