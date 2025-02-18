# Mario Uomo API Documentation

## Overview

This directory contains the comprehensive API documentation for the Mario Uomo e-commerce platform. The API is built with NestJS and follows RESTful principles, providing endpoints for managing products, orders, users, and various e-commerce operations.

## Documentation Structure

- `openapi.yaml`: OpenAPI/Swagger specification file
- `postman/`: Postman collection and environment files
- `examples/`: Example requests and responses
- `schemas/`: JSON Schema definitions

## Key Features

### Performance Optimizations

1. **Request Queuing**
   - Priority-based request processing
   - Background job handling
   - Queue monitoring and metrics

2. **Connection Pooling**
   - Configurable pool sizes
   - Connection lifecycle management
   - Pool health monitoring

3. **Caching**
   - Redis-based caching
   - Cache invalidation strategies
   - Hit rate monitoring

### Security

1. **Rate Limiting**
   - Request throttling
   - IP-based tracking
   - Configurable limits

2. **Authentication**
   - JWT-based authentication
   - Role-based access control
   - Token management

### Monitoring

1. **Health Checks**
   - System status monitoring
   - Component health tracking
   - Performance metrics

2. **Metrics**
   - Request/response times
   - Error rates
   - Cache hit rates
   - Database connection stats

## Using the API

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Rate Limiting

The API implements rate limiting with the following default limits:
- 100 requests per minute for authenticated users
- 30 requests per minute for unauthenticated users

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1708384866
```

### Caching

The API uses Redis for caching with the following default TTLs:
- Product listings: 5 minutes
- Category listings: 10 minutes
- User profiles: 1 minute

Cache-Control headers indicate caching behavior:
```http
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error information:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "error": "Must be a valid email address"
  }
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 429: Too Many Requests
- 500: Internal Server Error

## Development

### Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   pnpm run start:dev
   ```

### Testing

Run the test suite:
```bash
pnpm test
```

Generate test coverage:
```bash
pnpm test:cov
```

## Contributing

1. Follow the coding style guide
2. Write comprehensive tests
3. Update documentation for new endpoints
4. Submit a pull request

## Support

For API support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed
