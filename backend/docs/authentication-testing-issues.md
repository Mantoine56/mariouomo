# Authentication Testing Issues and Plan

## Current Status

We attempted to implement integration tests for authentication with a real database connection but encountered several technical issues:

1. **Entity Metadata Not Found**: When running the tests, we received `EntityMetadataNotFoundError: No metadata for "Profile" was found` errors. This indicates that TypeORM couldn't properly register the Profile entity during the test module initialization.

2. **Native Module Issues**: We also faced challenges with the bcrypt native module not being properly built for the test environment.

## Root Causes

The primary issues appear to be:

1. **TypeORM Entity Registration**: The TestDatabaseModule doesn't correctly register all entities needed for the authentication tests.

2. **Database Configuration**: The database connection may not be fully configured for the testing environment.

3. **Module Structure**: The current module structure makes it difficult to use both the real entities and repositories in tests while maintaining isolation.

## Current Testing Approach

Currently, our authentication testing relies on:

1. **Mocked Repositories**: We use jest.fn() to create mock implementations of repository methods.

2. **In-Memory Tests**: Tests use in-memory objects rather than actual database queries.

3. **JWT Validation**: We test JWT token generation and validation but not with database-stored users.

## Path Forward

To properly test authentication with a real database, we need to:

1. **Fix Entity Registration**:
   - Update TestDatabaseModule to explicitly include Profile and all related entities
   - Ensure entity paths are correctly resolved in the test environment

2. **Correct Database Connection**:
   - Verify that the test database connection is properly configured
   - Add logging to troubleshoot connection issues
   - Ensure the test database has the correct schema

3. **Improve Test Module Structure**:
   - Create a dedicated AuthTestDatabaseModule that includes all auth-related entities
   - Use a combination of real repositories and mock services where appropriate
   - Add proper cleanup operations to ensure test isolation

4. **Authentication Test Cases**:
   - Test user registration with database persistence
   - Verify login with database-stored credentials
   - Test token validation with database user lookup
   - Verify role-based access control with database-stored roles

## Sample Implementation

```typescript
// Sample implementation of improved TestDatabaseModule

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = getTestDatabaseConfig(configService);
        
        return {
          ...config,
          entities: [
            Profile,
            User,
            Role,
            Permission,
            // Add all other required entities
          ],
          autoLoadEntities: false,
          logging: true, // Enable logging for troubleshooting
        };
      },
    }),
    TypeOrmModule.forFeature([Profile, User, Role, Permission]),
  ],
  exports: [TypeOrmModule],
})
export class AuthTestDatabaseModule {}
```

## Timeline and Priority

These authentication testing improvements should be prioritized after completing the current backend fixes. Expected timeline:

1. Fix entity registration issues: 1 day
2. Implement database connection validation: 0.5 day
3. Create improved test module structure: 1 day
4. Implement comprehensive authentication test cases: 1.5 days

Total estimated time: 4 days of development work. 