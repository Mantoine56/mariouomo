# Orders Module Documentation

## Overview
The Orders module handles the complete lifecycle of customer orders in the Mario Uomo e-commerce platform. It provides robust functionality for order creation, management, and fulfillment while ensuring data consistency and proper inventory management.

## Core Features

### 1. Order Management
- **Status Management**: Comprehensive order status lifecycle
  - PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
  - Support for CANCELLED and REFUNDED states
  - Strict status transition validation
- **Concurrent Processing**: Safe handling of simultaneous orders
  - Pessimistic locking for inventory updates
  - Transaction management
  - Proper rollback on failures

### 2. Order Items
- Tracks individual items within orders
- Maintains price history
- Records product metadata at time of purchase
- Manages inventory updates

### 3. Address Management
- Separate shipping and billing addresses
- Address validation
- Flexible address format supporting international orders

## Technical Implementation

### Entities

#### Order Entity
```typescript
@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'decimal' })
  total_amount: number;

  @Column({ type: 'decimal' })
  subtotal: number;

  @Column({ type: 'decimal' })
  tax: number;

  @Column({ type: 'decimal' })
  shipping: number;

  @Column({ type: 'jsonb' })
  shipping_address: Address;

  @Column({ type: 'jsonb' })
  billing_address: Address;

  // Relationships
  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];
}
```

#### OrderItem Entity
```typescript
@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ type: 'uuid' })
  variant_id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal' })
  unit_price: number;

  @Column({ type: 'jsonb' })
  product_metadata: ProductMetadata;
}
```

### DTOs

#### CreateOrderDto
- Validates order creation input
- Handles nested item validation
- Validates addresses

#### UpdateOrderDto
- Manages order status updates
- Handles staff and customer notes
- Validates status transitions

### Service Layer

The OrderService implements:
1. **Transaction Management**
   - Atomic order creation
   - Safe inventory updates
   - Proper error handling

2. **Inventory Locking**
   - Pessimistic locks during order creation
   - Prevents overselling
   - Handles concurrent orders

3. **Status Management**
   - Validates status transitions
   - Handles side effects of status changes
   - Manages inventory for cancellations

### Controller Layer

Protected endpoints with proper authorization:
- POST `/orders` - Create new order
- PUT `/orders/:id` - Update order status
- GET `/orders/:id` - Get order details
- GET `/orders` - List user orders

## Testing

### Unit Tests
- Service layer testing
  - Transaction management
  - Inventory locking
  - Status transitions
  - Error handling

- Controller layer testing
  - Route handling
  - Authorization
  - Input validation
  - Response formatting

### Integration Tests
- End-to-end order flow
- Concurrent order processing
- Inventory management
- Status transition validation

## Error Handling

### Common Errors
1. **NotFoundException**
   - Order not found
   - Product variant not found
   - User profile not found

2. **ConflictException**
   - Insufficient inventory
   - Invalid status transition
   - Concurrent modification conflicts

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

## Security

### Authentication
- JWT-based authentication required for all endpoints
- User context validation for order access

### Authorization
- Role-based access control
- Admin-only endpoints for status updates
- User-specific order access control

## Performance Considerations

### Caching Strategy
- Order details caching
- User order list caching
- Cache invalidation on updates

### Database Optimization
- Proper indexing
- Efficient joins
- Transaction management

## Next Steps

1. **Order Fulfillment**
   - Implement fulfillment workflow
   - Add shipping provider integration
   - Implement tracking system

2. **Payment Integration**
   - Add payment processing
   - Handle refunds
   - Manage payment status

3. **Analytics**
   - Order metrics tracking
   - Performance monitoring
   - Business intelligence integration
