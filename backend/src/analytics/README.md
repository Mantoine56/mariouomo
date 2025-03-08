# Analytics Module

## Overview

The Analytics Module is responsible for collecting, processing, and aggregating metrics from various parts of the e-commerce platform. It provides insights into sales performance, inventory management, and customer behavior.

## Key Components

- **AnalyticsCollectorService**: Aggregates raw metrics into daily, weekly, and monthly summaries
- **AnalyticsSchedulerService**: Runs scheduled jobs to collect and process analytics data
- **RealTimeTrackingService**: Tracks real-time metrics as transactions and events occur
- **DashboardController**: Exposes endpoints for the analytics dashboard

## Architecture

The analytics module follows a layered architecture:

1. **Controllers**: Handle HTTP requests and delegate to services
2. **Services**: Contain business logic for analytics processing
3. **Repositories**: Interface with the database for CRUD operations
4. **Entities**: Define the data models for analytics metrics

## Testing

### Running Tests

The analytics module has several types of tests that can be run:

```bash
# Run all analytics tests (may have connection issues)
pnpm test:integration:db:analytics

# Run with mock database (may have connection issues)
DB_MOCK=true pnpm test:integration:mock -- test/integration/analytics

# Run simplified analytics tests (most reliable)
pnpm jest test/integration/analytics/analytics-simple-mock.spec.js

# Run isolated analytics tests (most comprehensive and reliable)
pnpm jest test/integration/analytics/analytics-isolated.spec.js
```

### Testing Strategy

We have multiple testing approaches, each with different tradeoffs:

1. **Isolated Tests (Most Reliable)**:
   - Pure JavaScript tests with no dependencies on NestJS or TypeORM
   - File: `analytics-isolated.spec.js`
   - Run with: `pnpm jest test/integration/analytics/analytics-isolated.spec.js`
   - Use for: Unit testing service methods with high reliability

2. **Simple Mocks (Basic Testing)**:
   - Simple tests without NestJS dependencies
   - File: `analytics-simple-mock.spec.js`
   - Run with: `pnpm jest test/integration/analytics/analytics-simple-mock.spec.js`
   - Use for: Basic unit testing with minimal setup

3. **Enhanced Mock Tests (With NestJS - WIP)**:
   - Tests that use NestJS with mock database and Redis
   - Files: `analytics-enhanced-mock.spec.js`
   - Run with: `pnpm jest test/integration/analytics/analytics-enhanced-mock.spec.js`
   - Use for: Testing service integration (currently having connection issues)

4. **Full Integration Tests (Real Database - WIP)**:
   - Tests with real database connection
   - Files: Various `*.integration.spec.ts` files
   - Run with: `pnpm test:integration:db:analytics`
   - Use for: End-to-end testing (currently having connection issues)

### Mock Utilities

Mock utilities are available in:
- `test/integration/utils/database-test-setup.js`: Provides database mocking utilities
- `test/integration/utils/test-database.module.js`: NestJS module for testing with database mocks
- `test/integration/utils/redis-mock.module.js`: Provides Redis client and cache service mocks
- `test/integration/utils/test-module.factory.js`: Factory for creating test modules with all dependencies mocked

### Recommended Testing Approach

When adding tests for the analytics module:

1. Start with isolated tests (`analytics-isolated.spec.js` pattern) for individual service methods
2. Use the simplest approach that meets your testing needs
3. If you need to test integration between services, use the isolated tests with mock implementations that call each other
4. Document any issues encountered with the more complex testing approaches

## Development Status

The analytics module is part of a larger migration effort. Current focus areas:

1. Improving test coverage and reliability
2. Resolving TypeScript and entity property mismatches
3. Enhancing real-time tracking capabilities

For more details on the migration progress, see `docs/phase4-testing-migration.md`.

## Contributing

When adding new features or fixing bugs in the analytics module:

1. Add appropriate tests using the isolated pattern
2. Ensure tests pass reliably
3. Update documentation if you change interfaces or behavior

## Entity Properties

### SalesMetrics
- `id`: UUID
- `store_id`: UUID, Foreign Key to Stores
- `date`: Date
- `total_sales`: Decimal
- `average_order_value`: Decimal
- `order_count`: Integer
- `refund_rate`: Decimal

### InventoryMetrics
- `id`: UUID
- `store_id`: UUID, Foreign Key to Stores
- `date`: Date
- `stock_level`: Integer
- `turnover_rate`: Decimal
- `out_of_stock_count`: Integer
- `restock_rate`: Decimal

### CustomerMetrics
- `id`: UUID
- `store_id`: UUID, Foreign Key to Stores
- `date`: Date
- `new_customers`: Integer
- `returning_customers`: Integer
- `customer_lifetime_value`: Decimal
- `geographic_distribution`: JSON Array

### RealTimeMetrics
- `id`: UUID
- `store_id`: UUID, Foreign Key to Stores
- `event_type`: String (Enum: 'sale', 'inventory', 'customer')
- `timestamp`: DateTime
- `data`: JSON Object 