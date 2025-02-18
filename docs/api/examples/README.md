# API Examples

This directory contains example requests and responses for the Mario Uomo API endpoints. These examples demonstrate common usage patterns, authentication, error handling, and performance features.

## Authentication

### Login Request
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Login Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## Product Management

### List Products (Cached)
```http
GET /v1/products?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

{
  "items": [
    {
      "id": "prod_123",
      "name": "Classic White Shirt",
      "price": 89.99,
      "stock": 100,
      "category": "shirts"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

#### Not Modified Response
```http
HTTP/1.1 304 Not Modified
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## Error Handling

### Rate Limit Exceeded
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708384866

{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later",
  "details": {
    "retryAfter": 60
  }
}
```

### Validation Error
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "error": "Must be a valid email address"
  }
}
```

## Health Monitoring

### Health Check
```http
GET /v1/health
```

#### Healthy Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2025-02-18T22:41:06Z",
  "services": {
    "database": {
      "status": "ok",
      "poolSize": 10,
      "activeConnections": 3
    },
    "redis": {
      "status": "ok",
      "memoryUsage": 45.5,
      "hitRate": 0.95
    }
  }
}
```

#### Degraded Response
```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{
  "status": "degraded",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2025-02-18T22:41:06Z",
  "services": {
    "database": {
      "status": "error",
      "poolSize": 10,
      "activeConnections": 10
    },
    "redis": {
      "status": "ok",
      "memoryUsage": 45.5,
      "hitRate": 0.95
    }
  }
}
```

## Performance Features

### Request Queuing
The API uses Redis-based request queuing with three priority levels:

1. High Priority
```http
POST /v1/orders
X-Priority: high
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

2. Default Priority
```http
GET /v1/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

3. Background Tasks
```http
POST /v1/reports/generate
X-Priority: background
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Connection Pooling
Database connections are managed through a connection pool. The pool status can be monitored through the health endpoint:

```http
GET /v1/health/database
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

HTTP/1.1 200 OK
Content-Type: application/json

{
  "poolSize": 10,
  "activeConnections": 3,
  "idleConnections": 7,
  "waitingRequests": 0,
  "maxPoolSize": 20
}
```
