# Stores Module

The Stores module is a core component of the Mario Uomo e-commerce platform that manages merchant stores. It provides functionality for creating, managing, and monitoring stores, including their products, settings, and operational status.

## Features

- Store lifecycle management (creation, updates, deletion)
- Store status management (active/inactive/suspended)
- Store settings and metadata management
- Product relationship management
- Event-driven architecture for store operations

## Data Model

### Store Entity

The `Store` entity represents a merchant's store and includes:

- `id` (UUID): Unique identifier
- `name` (string): Store name
- `description` (string, optional): Store description
- `status` (enum): Store operational status
- `settings` (JSON): Store-specific settings
- `metadata` (JSON): Additional store metadata
- `products` (relation): Associated products
- Timestamps: `created_at`, `updated_at`, `deleted_at`

## DTOs

### CreateStoreDto

Used when creating a new store:

```typescript
{
  name: string;              // Required
  description?: string;      // Optional
  status: StoreStatus;       // Required, enum value
  settings?: object;         // Optional
  metadata?: object;         // Optional
}
```

### UpdateStoreDto

Used for updating store information (all fields optional):

```typescript
{
  name?: string;
  description?: string;
  status?: StoreStatus;
  settings?: object;
  metadata?: object;
}
```

## Events

The module emits the following events:

- `store.created`: When a new store is created
- `store.updated`: When store details are updated
- `store.status.updated`: When store status changes
- `store.deleted`: When a store is removed

## Validation Rules

1. Store Name:
   - Required
   - Must be a string
   - Cannot be empty

2. Store Status:
   - Must be one of: 'active', 'inactive', 'suspended'
   - Required for creation
   - Optional for updates

3. Settings and Metadata:
   - Must be valid JSON objects when provided
   - Optional for both creation and updates

## Service Methods

### StoreService

- `create(createStoreDto)`: Create a new store
- `findAll(skip, take)`: Get paginated list of stores
- `findOne(id)`: Get store by ID
- `update(id, updateStoreDto)`: Update store details
- `remove(id)`: Delete a store
- `updateStatus(id, status)`: Update store status

## Error Handling

The module implements proper error handling for:

1. Invalid store data
2. Non-existent stores
3. Invalid status transitions
4. Database operation failures

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

### Creating a Store

```typescript
const store = await storeService.create({
  name: 'Fashion Boutique',
  description: 'High-end fashion store',
  status: StoreStatus.ACTIVE,
  settings: {
    theme: 'modern',
    currency: 'USD'
  },
  metadata: {
    region: 'North America',
    category: 'Fashion'
  }
});
```

### Updating Store Status

```typescript
const updatedStore = await storeService.updateStatus(
  storeId,
  StoreStatus.INACTIVE
);
```

## Future Improvements

1. Store Analytics Integration
   - Sales metrics
   - Traffic analytics
   - Performance monitoring

2. Enhanced Store Settings
   - Theme customization
   - Payment gateway configuration
   - Shipping provider integration

3. Multi-location Support
   - Multiple physical locations
   - Region-specific settings
   - Inventory management per location

4. Advanced Store Features
   - Store-specific promotions
   - Custom domain support
   - Store-level user roles
