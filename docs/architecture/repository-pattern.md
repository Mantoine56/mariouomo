# Repository Pattern Implementation

## Overview

This document outlines the repository pattern implementation used in the Mario Uomo backend. The repository pattern provides an abstraction layer between the domain/business logic and the data access logic.

## Implementation Details

### BaseRepository

The `BaseRepository` class provides common CRUD operations for all entities. It uses a composition pattern with TypeORM's Repository to ensure compatibility with newer TypeORM versions.

Key features:
- Soft delete functionality
- Standardized error handling
- Consistent query patterns
- Type-safe operations

### Repository Structure

Each entity has its own repository that extends the BaseRepository:

```typescript
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(entityManager: EntityManager) {
    super(Product, entityManager);
  }
  
  // Entity-specific methods...
}
```

### Dependency Injection

Repositories are registered in their respective modules and injected into services:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage]),
  ],
  providers: [
    ProductRepository,
    ProductImageRepository,
  ],
  exports: [
    ProductRepository,
    ProductImageRepository,
  ],
})
export class ProductsModule {}
```

## Best Practices

1. **Use composition over inheritance** - The BaseRepository uses composition with TypeORM's Repository
2. **Keep repositories focused** - Each repository should handle a single entity
3. **Implement domain-specific queries** - Add specialized methods for complex domain operations
4. **Use transactions for multi-entity operations** - Ensure data consistency
5. **Implement proper error handling** - Throw appropriate exceptions for database errors

## Migration from Legacy Pattern

The codebase is being migrated from the legacy `@EntityRepository` decorator approach to the modern dependency injection approach. This involves:

1. Updating repository classes to use constructor injection
2. Registering repositories as providers in their modules
3. Using composition instead of inheritance for TypeORM repositories

## Examples

### BaseRepository (New Pattern)

```typescript
export abstract class BaseRepository<T extends BaseEntity> {  
  protected repository: Repository<T>;
  
  constructor(
    private readonly entityType: Type<T>,
    private readonly entityManager: EntityManager
  ) {
    this.repository = entityManager.getRepository<T>(entityType);
  }
  
  // Common CRUD methods...
}
```

### Entity Repository (New Pattern)

```typescript
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(entityManager: EntityManager) {
    super(Product, entityManager);
  }
  
  // Product-specific methods...
}
```

## Testing Repositories

Repositories should be tested with:
1. Unit tests using a mock EntityManager
2. Integration tests using a test database
3. Transaction tests to verify multi-entity operations
