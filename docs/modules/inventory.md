# Inventory Module Documentation

## Overview
The Inventory Module manages product stock levels across multiple locations, handling stock adjustments, reservations, and low stock notifications. It integrates with the Orders and Products modules to maintain accurate inventory levels during order processing.

## Features
- Real-time inventory tracking
- Multi-location support
- Stock reservation system
- Low stock notifications
- Inventory movement history
- Reorder point management

## Core Components

### InventoryItem Entity
```typescript
class InventoryItem {
  id: string;                 // UUID
  variant_id: string;         // Reference to ProductVariant
  location: string;           // Storage location
  quantity: number;           // Current stock quantity
  reserved_quantity: number;  // Quantity reserved for orders
  reorder_point: number;      // Threshold for low stock
  reorder_quantity: number;   // Quantity to reorder
  version: number;            // For optimistic locking
}
```

### DTOs
1. **CreateInventoryDto**
   - Creates new inventory items
   - Validates initial stock levels and locations

2. **UpdateInventoryDto**
   - Updates inventory settings
   - Modifies reorder points and quantities

3. **AdjustInventoryDto**
   - Adjusts stock levels
   - Records reason and reference for audit trail

## API Endpoints

### Admin Endpoints
All endpoints require ADMIN role.

#### POST /inventory
Creates a new inventory item
```typescript
{
  "variant_id": "uuid",
  "location": "string",
  "quantity": number,
  "reorder_point": number,
  "reorder_quantity": number
}
```

#### PUT /inventory/:id
Updates inventory settings
```typescript
{
  "reorder_point": number,
  "reorder_quantity": number
}
```

#### PUT /inventory/:id/adjust
Adjusts inventory quantity
```typescript
{
  "adjustment": number,
  "reason": "string",
  "reference": "string"
}
```

#### GET /inventory/low-stock
Returns items below reorder point

#### GET /inventory/:id
Returns specific inventory item

#### GET /inventory/by-variant/:variantId
Returns inventory items for a variant

#### GET /inventory/by-location/:location
Returns inventory items at a location

## Events

### Emitted Events
1. `inventory.created`: New inventory item created
   ```typescript
   {
     inventory_id: string;
     variant_id: string;
     quantity: number;
   }
   ```

2. `inventory.updated`: Inventory settings updated
   ```typescript
   {
     inventory_id: string;
     // Updated fields
   }
   ```

3. `inventory.adjusted`: Stock level adjusted
   ```typescript
   {
     inventory_id: string;
     quantity: number;
     reason: string;
     type: 'increase' | 'decrease';
   }
   ```

4. `inventory.low_stock`: Item reached reorder point
   ```typescript
   {
     inventory_id: string;
     variant_id: string;
     quantity: number;
     reorder_point: number;
   }
   ```

5. `inventory.reserved`: Stock reserved for order
   ```typescript
   {
     inventory_id: string;
     quantity: number;
   }
   ```

### Event Handling
- Events are emitted after successful database transactions
- Event payloads include relevant IDs for tracking
- Subscribers should handle events idempotently
- Events are used for:
  - Analytics tracking
  - Notifications
  - Cache invalidation
  - Integration with external systems

## Integration Points

### Orders Module
- Reserves inventory during order creation
- Releases inventory if order cancelled
- Decrements inventory after order fulfillment

### Products Module
- References product variants
- Validates variant existence
- Syncs with variant status changes

## Error Handling

### Common Errors
1. `NotFoundException`: Item/variant not found
2. `ConflictException`: Insufficient stock
3. `ConflictException`: Duplicate inventory item
4. `BadRequestException`: Invalid adjustment

## Best Practices

### Stock Management
1. Always use transactions for stock adjustments
2. Implement optimistic locking for concurrent updates
3. Maintain audit trail for all movements
4. Set appropriate reorder points

### Performance
1. Index frequently queried fields
2. Use batch operations for bulk updates
3. Implement caching for static data
4. Monitor query performance

## Security
1. Role-based access control (ADMIN only)
2. Input validation on all endpoints
3. Audit logging for all operations
4. Transaction isolation for concurrent access

## Testing

### Unit Tests
The module includes comprehensive unit tests covering:

1. **Inventory Service**
   - Stock adjustments (increase/decrease)
   - Inventory reservations
   - Low stock detection
   - Error handling for insufficient stock
   - Concurrent access handling

2. **Event Emission**
   - Proper event names and payloads
   - Event emission after successful operations
   - No events on failed operations

3. **Transaction Handling**
   - Proper transaction isolation
   - Rollback on errors
   - Pessimistic locking for concurrent access

### Test Implementation
```typescript
describe('InventoryService', () => {
  describe('adjustInventory', () => {
    it('should successfully adjust inventory quantity', async () => {
      // Tests proper stock adjustment and event emission
    });

    it('should fail to adjust inventory when insufficient stock', async () => {
      // Tests error handling for insufficient stock
    });
  });

  describe('reserveInventory', () => {
    it('should successfully reserve inventory', async () => {
      // Tests proper reservation and event emission
    });

    it('should fail to reserve inventory when insufficient available stock', async () => {
      // Tests error handling for insufficient stock
    });
  });
});
```

### Testing Best Practices
1. **Mock Data**
   - Use complete type information
   - Include all required fields
   - Follow entity constraints

2. **Transaction Mocking**
   - Mock EntityManager for proper isolation
   - Handle both transaction signatures
   - Simulate proper locking behavior

3. **Event Testing**
   - Verify correct event names
   - Validate event payload structure
   - Ensure proper timing of emission

4. **Error Handling**
   - Test all error conditions
   - Verify proper exception types
   - Ensure proper error messages
