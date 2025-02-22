# Authentication Module

## Overview
The Authentication module provides secure user authentication and authorization using JWT tokens and role-based access control. This module is essential for protecting routes and ensuring users have appropriate permissions to access different parts of the application.

## Components

### Guards

#### JwtAuthGuard
- **Purpose**: Protects routes requiring valid JWT authentication
- **Implementation**: Extends NestJS's built-in AuthGuard
- **Features**:
  - Validates JWT tokens
  - Handles token expiration
  - Attaches user information to request

#### RolesGuard
- **Purpose**: Implements role-based access control (RBAC)
- **Implementation**: Uses custom `@Roles()` decorator
- **Features**:
  - Validates user roles against required roles
  - Supports multiple role requirements
  - Handles cases with no role requirements

### Testing
Both guards have comprehensive test coverage:

#### JwtAuthGuard Tests
- Verifies guard definition
- Confirms proper extension of AuthGuard
- Tests JWT strategy implementation

#### RolesGuard Tests
- Tests access control based on roles:
  - Allows access when no roles required
  - Denies access for insufficient roles
  - Allows access with required role
  - Handles multiple required roles

## Usage

### Protecting Routes
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('protected-route')
async protectedRoute() {
  // Only authenticated admins can access
}
```

### Role Decorators
```typescript
// Require multiple roles
@Roles('admin', 'manager')

// No roles required
@Roles()
```

## Best Practices
1. Always use both guards together for protected routes
2. Define roles using constants to prevent typos
3. Keep role checks granular and specific
4. Use meaningful role names that reflect actual permissions

## Security Considerations
- JWT tokens are stored in HTTP-only cookies
- Role validation happens on every request
- Failed authentication attempts are logged
- Rate limiting is implemented to prevent brute force attacks
