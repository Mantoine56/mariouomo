# Users Module

The Users module is a core component of the Mario Uomo e-commerce platform that manages user profiles, addresses, and authentication. It provides functionality for user management, role-based access control, and profile customization.

## Features

- User profile management (creation, updates, deletion)
- Role-based access control (RBAC)
- User status management
- Address management (shipping/billing)
- Integration with Supabase Auth
- Event-driven architecture for user operations

## Data Model

### Profile Entity

The `Profile` entity represents a user in the system and includes:

- `id` (UUID): Unique identifier
- `full_name` (string): User's full name
- `email` (string): User's email address (linked to Supabase Auth)
- `role` (enum): User's role (customer/admin/manager)
- `status` (enum): Account status
- `addresses` (relation): Associated addresses
- `orders` (relation): Associated orders
- Timestamps: `created_at`, `updated_at`, `deleted_at`

### UserAddress Entity

The `UserAddress` entity represents a user's address:

- `id` (UUID): Unique identifier
- `profile_id` (UUID): Reference to user profile
- `type` (string): Address type (shipping/billing)
- `is_default` (boolean): Default status for type
- `street` (string): Street address
- `city` (string): City
- `state` (string): State/Province
- `country` (string): Country
- `postal_code` (string): Postal/ZIP code
- Timestamps: `created_at`, `updated_at`

## DTOs

### CreateProfileDto

Used when creating a new user profile:

```typescript
{
  full_name: string;           // Required
  email: string;              // Required, must be valid email
  role?: UserRole;            // Optional, defaults to CUSTOMER
  status?: UserStatus;        // Optional, defaults to ACTIVE
}
```

### UpdateProfileDto

Used for updating profile information (all fields optional):

```typescript
{
  full_name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}
```

## Enums

### UserRole

```typescript
enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager'
}
```

### UserStatus

```typescript
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}
```

## Events

The module emits the following events:

- `profile.created`: When a new profile is created
- `profile.updated`: When profile details are updated
- `profile.status.updated`: When profile status changes
- `profile.deleted`: When a profile is removed

## Validation Rules

1. Profile:
   - Full name is required
   - Email must be valid and unique
   - Role must be one of: 'customer', 'admin', 'manager'
   - Status must be one of: 'active', 'inactive', 'suspended'

2. Address:
   - Street, city, state, country required
   - Postal code must be valid format
   - Type must be either 'shipping' or 'billing'
   - Only one default address per type allowed

## Service Methods

### ProfileService

- `create(createProfileDto)`: Create a new profile
- `findAll(skip, take)`: Get paginated list of profiles
- `findOne(id)`: Get profile by ID
- `findByEmail(email)`: Get profile by email
- `update(id, updateProfileDto)`: Update profile details
- `updateStatus(id, status)`: Update profile status
- `remove(id)`: Delete a profile

## Error Handling

The module implements proper error handling for:

1. Invalid profile data
2. Non-existent profiles
3. Duplicate email addresses
4. Invalid role/status transitions
5. Database operation failures

## Testing

The module includes comprehensive test coverage:

### Unit Tests
- Service method tests
- DTO validation tests
- Event emission tests

### Integration Tests
- Database operation tests
- Event handling tests
- Error handling tests

## Usage Examples

### Creating a Profile

```typescript
const profile = await profileService.create({
  full_name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.CUSTOMER,
  status: UserStatus.ACTIVE
});
```

### Updating Profile Status

```typescript
const updatedProfile = await profileService.updateStatus(
  profileId,
  UserStatus.INACTIVE
);
```

### Finding Profile by Email

```typescript
const profile = await profileService.findByEmail('john@example.com');
```

## Future Improvements

1. Enhanced Authentication
   - Two-factor authentication
   - Social login integration
   - Password recovery flow

2. Profile Customization
   - Profile pictures
   - Preferences management
   - Notification settings

3. Advanced RBAC
   - Custom role definitions
   - Permission-based access
   - Role hierarchies

4. Address Features
   - Address validation
   - Multiple shipping addresses
   - Address book management

5. Profile Analytics
   - Login history
   - Activity tracking
   - Security monitoring
