# Authentication Module

## Overview
The Authentication module provides secure user authentication and authorization using JWT tokens and role-based access control. This module is integrated with Supabase for user management and authentication, ensuring a robust and scalable authentication system. It supports both production and development environments with appropriate fallbacks.

## Components

### Services

#### AuthService
- **Purpose**: Manages authentication logic and user validation
- **Implementation**: Integrates with Supabase for user profile management
- **Features**:
  - Validates JWT tokens
  - Creates and retrieves user profiles from Supabase
  - Handles development mode with special considerations
  - Provides test endpoints for debugging

#### SupabaseService
- **Purpose**: Provides a client for interacting with Supabase
- **Implementation**: Wraps the Supabase JavaScript client
- **Features**:
  - Manages connection to Supabase
  - Provides methods for user profile management
  - Handles errors gracefully with detailed logging

### Strategies

#### SupabaseJwtStrategy
- **Purpose**: Validates JWT tokens issued by Supabase
- **Implementation**: Extends Passport's JWT strategy
- **Features**:
  - Verifies token signatures using Supabase JWT secret
  - Extracts user information from token payload
  - Supports development mode with fallback options

### Guards

#### JwtAuthGuard
- **Purpose**: Protects routes requiring valid JWT authentication
- **Implementation**: Extends NestJS's built-in AuthGuard
- **Features**:
  - Validates JWT tokens
  - Handles token expiration
  - Attaches user information to request
  - Supports public routes via the `@Public()` decorator

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

### Public Routes
```typescript
@Public()
@Get('public-route')
async publicRoute() {
  // Anyone can access this route
}
```

### Role Decorators
```typescript
// Require multiple roles
@Roles('admin', 'manager')

// No roles required
@Roles()
```

## Environment Configuration

The authentication module requires the following environment variables:

```
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
```

- `SUPABASE_URL`: The URL of your Supabase project
- `SUPABASE_SERVICE_KEY`: The service role API key from your Supabase project (found in Project Settings > API)
- `SUPABASE_JWT_SECRET`: The JWT secret used to verify tokens issued by Supabase
- `JWT_SECRET`: The secret used to sign JWT tokens (can be the same as SUPABASE_JWT_SECRET)
- `JWT_EXPIRES_IN`: The expiration time for JWT tokens

## Development Mode

In development mode, the authentication module provides special features:

1. **Token Validation**: In development, invalid tokens will return a mock payload with a predefined user ID
2. **User Creation**: If a user doesn't exist in Supabase, a basic profile will be created automatically
3. **Debug Endpoints**: Special endpoints are available for debugging authentication issues:
   - `/auth/debug-token`: Provides detailed information about token validation
   - `/auth/test-supabase`: Tests the connection to Supabase

## Best Practices
1. Always use both guards together for protected routes
2. Define roles using constants to prevent typos
3. Keep role checks granular and specific
4. Use meaningful role names that reflect actual permissions
5. Use the `@Public()` decorator for routes that don't require authentication

## Security Considerations
- JWT tokens should be stored in HTTP-only cookies
- Role validation happens on every request
- Failed authentication attempts are logged
- Rate limiting is implemented to prevent brute force attacks
- The Supabase service role key should never be exposed to the client
- In production, always use HTTPS to protect token transmission
