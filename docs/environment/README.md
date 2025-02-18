# Environment Setup Guide

This guide provides detailed instructions for setting up development, staging, and production environments for the Mario Uomo platform.

## Development Environment

### Prerequisites

1. **Node.js Setup**
   ```bash
   # Install nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Install and use Node.js 18
   nvm install 18
   nvm use 18
   ```

2. **pnpm Setup**
   ```bash
   # Install pnpm
   npm install -g pnpm

   # Configure pnpm
   pnpm config set store-dir ~/.pnpm-store
   ```

3. **Git Setup**
   ```bash
   # Configure Git
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"

   # Set up Git hooks directory
   git config core.hooksPath .githooks
   ```

4. **Database Setup**
   ```bash
   # Install PostgreSQL
   brew install postgresql@14

   # Start PostgreSQL
   brew services start postgresql@14

   # Create database
   createdb mario_uomo_dev
   ```

5. **Redis Setup**
   ```bash
   # Install Redis
   brew install redis

   # Start Redis
   brew services start redis
   ```

### Project Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Mantoine56/mariouomo.git
   cd mariouomo
   ```

2. **Install Dependencies**
   ```bash
   # Install project dependencies
   pnpm install

   # Install development tools
   pnpm add -D @types/node typescript ts-node
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Database Migration**
   ```bash
   # Run migrations
   cd backend
   pnpm typeorm migration:run
   ```

### Development Tools

1. **IDE Setup (VSCode)**
   ```bash
   # Install recommended extensions
   code --install-extension dbaeumer.vscode-eslint
   code --install-extension esbenp.prettier-vscode
   code --install-extension ms-vscode.vscode-typescript-tslint-plugin
   ```

2. **Debugging Tools**
   ```bash
   # Install debugging tools
   pnpm add -D debug
   pnpm add -D @types/debug
   ```

3. **Testing Tools**
   ```bash
   # Install testing dependencies
   pnpm add -D jest @types/jest ts-jest
   pnpm add -D supertest @types/supertest
   ```

## Staging Environment

### Infrastructure Setup

1. **Heroku Setup**
   ```bash
   # Install Heroku CLI
   brew tap heroku/brew && brew install heroku

   # Login to Heroku
   heroku login
   ```

2. **Database Setup**
   ```bash
   # Create Heroku Postgres database
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Redis Setup**
   ```bash
   # Create Redis instance
   heroku addons:create heroku-redis:hobby-dev
   ```

### Environment Configuration

```env
# Node
NODE_ENV=staging
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://user:password@host:port

# Monitoring
NEW_RELIC_LICENSE_KEY=staging-license-key
NEW_RELIC_APP_NAME=mario-uomo-staging

# Logging
LOG_LEVEL=debug
```

## Production Environment

### Security Requirements

1. **SSL/TLS Configuration**
   - Enable HTTPS only
   - Configure SSL certificates
   - Set up automatic renewal

2. **Network Security**
   - Configure firewalls
   - Set up VPC
   - Implement WAF

3. **Access Control**
   - Set up IAM roles
   - Configure RBAC
   - Implement MFA

### Performance Configuration

1. **Database Optimization**
   ```env
   # Database Pool
   DB_POOL_MIN=5
   DB_POOL_MAX=20
   DB_POOL_IDLE_TIMEOUT=30000
   DB_POOL_ACQUIRE_TIMEOUT=60000
   DB_POOL_REAP_INTERVAL=1000
   ```

2. **Redis Configuration**
   ```env
   # Cache Settings
   CACHE_PRODUCTS_MAX_AGE=300
   CACHE_CATEGORIES_MAX_AGE=600
   CACHE_DEFAULT_MAX_AGE=60
   ```

3. **Application Settings**
   ```env
   # Performance
   NODE_ENV=production
   CLUSTER_MODE=true
   WORKER_THREADS=4
   ```

## Environment-Specific Features

### Development
- Hot reloading
- Debug logging
- Test data seeding
- Performance profiling

### Staging
- Monitoring integration
- Error tracking
- Load testing
- Feature flags

### Production
- High availability
- Auto-scaling
- Disaster recovery
- Performance monitoring

## Monitoring Setup

1. **New Relic Configuration**
   ```env
   NEW_RELIC_LICENSE_KEY=your-license-key
   NEW_RELIC_APP_NAME=mario-uomo-${ENV}
   NEW_RELIC_LOG_LEVEL=info
   ```

2. **Logging Configuration**
   ```env
   LOG_LEVEL=info
   LOG_FORMAT=json
   LOG_MAX_FILES=14d
   LOG_MAX_SIZE=20m
   ```

## CI/CD Configuration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: mario-uomo
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Local Development

### Starting the Application

1. **Backend**
   ```bash
   cd backend
   pnpm dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   pnpm dev
   ```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### Database Management

```bash
# Create migration
pnpm typeorm migration:create

# Run migrations
pnpm typeorm migration:run

# Revert migration
pnpm typeorm migration:revert
```

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check database status
   pg_isready -h localhost

   # Reset database
   dropdb mario_uomo_dev
   createdb mario_uomo_dev
   ```

2. **Redis Connection**
   ```bash
   # Check Redis status
   redis-cli ping

   # Clear Redis cache
   redis-cli flushall
   ```

3. **Node.js Issues**
   ```bash
   # Clear node_modules
   rm -rf node_modules
   pnpm install

   # Clear pnpm cache
   pnpm store prune
   ```

## Security Guidelines

1. **Environment Variables**
   - Never commit .env files
   - Use strong secrets
   - Rotate credentials regularly

2. **Code Security**
   - Run security audits
   - Update dependencies
   - Follow security best practices

3. **Access Control**
   - Use least privilege principle
   - Implement proper authentication
   - Enable audit logging
