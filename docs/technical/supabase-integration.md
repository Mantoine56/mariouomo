# Supabase Integration

## Overview

This document outlines the integration of Supabase with the Mario Uomo platform. Supabase is used for user authentication and profile management, providing a robust and scalable solution for user management.

## Architecture

The integration follows a service-based approach:

1. **SupabaseService**: A wrapper around the Supabase JavaScript client that provides methods for interacting with Supabase.
2. **AuthService**: Uses the SupabaseService to validate users and manage profiles.
3. **SupabaseJwtStrategy**: A Passport strategy for validating JWT tokens issued by Supabase.

## Setup

### Prerequisites

1. A Supabase account and project
2. Service role API key from your Supabase project
3. JWT secret for token validation

### Environment Configuration

The following environment variables are required:

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

## Database Schema

### Profiles Table

The `profiles` table in Supabase stores user profile information:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow select own profile or admin"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow update own profile or admin"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
```

## Authentication Flow

1. **User Login**: User logs in through Supabase Auth (handled by the frontend)
2. **Token Generation**: Supabase issues a JWT token
3. **Token Validation**: Backend validates the token using the SupabaseJwtStrategy
4. **User Validation**: AuthService validates the user and retrieves their profile
5. **Profile Creation**: If the user doesn't exist, a profile is created automatically

## Development Mode

In development mode, the authentication system provides special features:

1. **Token Validation**: Invalid tokens will return a mock payload with a predefined user ID
2. **User Creation**: If a user doesn't exist in Supabase, a basic profile will be created automatically
3. **Debug Endpoints**: Special endpoints are available for debugging authentication issues:
   - `/auth/debug-token`: Provides detailed information about token validation
   - `/auth/test-supabase`: Tests the connection to Supabase

## Troubleshooting

### Common Issues

1. **Invalid API Key**: Ensure the `SUPABASE_SERVICE_KEY` is the service role key, not the anon key
2. **JWT Validation Errors**: Verify that `SUPABASE_JWT_SECRET` matches the JWT secret in your Supabase project
3. **Profile Not Found**: Check if the user exists in the `profiles` table and if the ID matches the token's `sub` claim

### Debugging

1. Use the `/auth/test-supabase` endpoint to test the Supabase connection
2. Use the `/auth/debug-token` endpoint to debug token validation issues
3. Check the logs for detailed error messages

## Security Considerations

1. **Service Role Key**: The service role key has admin privileges and should never be exposed to the client
2. **JWT Secret**: Keep the JWT secret secure and use environment variables
3. **Row Level Security**: Use Supabase's Row Level Security to restrict access to data
4. **HTTPS**: Always use HTTPS in production to protect token transmission

## References

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase Auth Documentation](https://supabase.io/docs/guides/auth)
- [NestJS Passport Documentation](https://docs.nestjs.com/security/authentication)
- [JWT Documentation](https://jwt.io/introduction) 