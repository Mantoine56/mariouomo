# Testing Documentation

This document provides detailed information about the test environment setup and how to run various types of tests in the project.

## Testing Strategy

The project uses a multi-layered testing approach:

1. **Unit Tests**: For testing individual functions and components in isolation
2. **Integration Tests**: For testing components working together with database interactions
3. **End-to-End Tests**: For testing the entire application flow

## Test Database Setup

As per our database migration plan, we now use a separate dedicated test database:

- The test database is a clone of the production schema
- The test database is hosted on Supabase at `db.[TEST-PROJECT-ID].supabase.co`
- All tests run against this test database to avoid production data corruption
- The database is reset between test runs to ensure consistent starting conditions

## Environment Configuration

Tests use a special environment configuration defined in `test-environment.ts`:

- Sets necessary environment variables for the test environment
- Configures connections to the test database
- Disables Redis for test runs (falls back to mock implementation)
- Sets up minimal AWS mock credentials

## Running Tests

### Unit Tests

Run unit tests with:

```bash
pnpm test
```

### Integration Tests

Integration tests can be run with:

```bash
# Run all integration tests
pnpm test:integration

# Run specific integration test files
pnpm jest test/integration/analytics/analytics-mock.integration.spec.ts
```

### Database-Dependent Tests

Tests that require database connectivity use the dedicated test database:

```bash
# Run all database integration tests
pnpm test:integration:db

# Run analytics-specific database tests
pnpm test:integration:db:analytics
```

## Mocking Strategy

For some tests, especially when testing in isolation, we use mocks:

- `createMockDataSource()`: Creates a mock TypeORM DataSource for testing without database connectivity
- Mock implementations for repositories and services are provided
- Jest spies are used to verify method calls without executing actual database operations

## Troubleshooting Common Issues

1. **TypeScript Errors**: Use `TS_NODE_TRANSPILE_ONLY=1` to bypass TypeScript errors during testing
2. **Database Connection Issues**: Ensure the test database URL is correctly set in the environment
3. **Redis Errors**: Redis is disabled by default in tests; check if `REDIS_ENABLED='false'` is set

## CI/CD Integration

The GitHub Actions workflows are configured to:

1. Run all tests on each PR
2. Connect to the test database using secure environment variables
3. Report test coverage and results

## Maintaining Test Data

- Test data should be created and cleaned up within each test suite
- Use the `setupTestData()` and `cleanupTestData()` functions in test files
- Avoid creating dependencies between test suites 