# Discounts Module

## Overview
The Discounts module manages promotional discounts and coupon codes in the e-commerce platform. It provides functionality for creating, validating, and applying discounts to customer orders with comprehensive validation rules and usage tracking.

## Features

### Discount Types
- **Percentage**: Applies a percentage discount to the cart total
- **Fixed Amount**: Applies a fixed amount discount

### Validation Rules
- Minimum purchase amount
- Usage limits
- Valid date range
- Customer eligibility:
  - New customers only
  - Minimum previous orders
  - Specific customer groups

## Components

### DTOs

#### CreateDiscountDto
```typescript
{
  name: string;              // Name of the discount
  description?: string;      // Optional description
  code: string;             // Unique discount code
  type: DiscountType;       // PERCENTAGE or FIXED_AMOUNT
  value: number;            // Discount value
  minimum_purchase?: number; // Minimum cart total
  maximum_discount?: number; // Maximum discount amount
  starts_at: Date;          // Start date
  ends_at?: Date;           // Optional end date
  usage_limit?: number;     // Maximum number of uses
  rules?: {                 // Optional validation rules
    customer_eligibility: {
      new_customers_only?: boolean;
      minimum_previous_orders?: number;
      specific_customer_groups?: string[];
    };
  };
}
```

#### UpdateDiscountDto
Extends `CreateDiscountDto` with all fields optional for partial updates.

#### ValidateDiscountDto
```typescript
{
  code: string;              // Discount code to validate
  cart_total: number;        // Current cart total
  previous_orders?: number;  // Customer's order count
  customer_groups?: string[]; // Customer's group memberships
}
```

### Service Methods

#### createDiscount
Creates a new discount with validation for:
- Unique discount code
- Valid date range
- Proper discount values

#### validateDiscount
Validates a discount code against:
- Existence and active status
- Date range validity
- Usage limits
- Customer eligibility
- Minimum purchase requirements

#### calculateDiscountAmount
Calculates final discount amount considering:
- Discount type (percentage/fixed)
- Maximum discount limits
- Cart total

#### recordDiscountUsage
Records discount usage with:
- Atomic updates using transactions
- Usage limit validation
- Event emission for tracking

## Events

The module implements a comprehensive event system for tracking discount-related activities:

### Event Types

#### `discount.created`
Emitted when a new discount is successfully created.
```typescript
{
  discount_id: string;
  code: string;
  type: DiscountType;
  value: number;
}
```

#### `discount.used`
Emitted when a discount is successfully applied to an order.
```typescript
{
  discount_id: string;
  code: string;
  times_used: number;
}
```

#### `discount.validated`
Emitted when a discount code passes validation checks.
```typescript
{
  discount_id: string;
  code: string;
  cart_total: number;
  is_valid: true;
}
```

#### `discount.validation_failed`
Emitted when a discount code fails validation.
```typescript
{
  discount_id?: string;
  code: string;
  cart_total?: number;
  reason: string;
}
```

### Event Handling Implementation

The module uses NestJS's EventEmitter2 for event handling:

```typescript
// Subscribing to events
@OnEvent('discount.used')
handleDiscountUsed(payload: DiscountUsedEvent) {
  // Handle discount usage
}

// Emitting events
this.eventEmitter.emit('discount.created', {
  discount_id: newDiscount.id,
  code: newDiscount.code,
  type: newDiscount.type,
  value: newDiscount.value
});
```

### Testing Events

The event system is thoroughly tested:
- Event emission on successful operations
- Proper event payloads
- Error case handling
- Transaction rollback scenarios

### Best Practices for Event Handling

1. **Atomic Operations**
   - Events are emitted only after successful database transactions
   - Failed operations trigger appropriate error events

2. **Event Payload Consistency**
   - Standardized payload structure
   - Required fields for each event type
   - Type-safe event definitions

3. **Error Handling**
   - Clear error messages in validation failure events
   - Proper error propagation
   - Transaction rollback on failures

4. **Performance Considerations**
   - Asynchronous event handling
   - Proper error boundaries
   - Event payload size optimization

## Usage Example with Events

```typescript
// Create a discount with event handling
const discount = await discountService.createDiscount({
  name: 'Summer Sale',
  code: 'SUMMER2025',
  type: DiscountType.PERCENTAGE,
  value: 20,
  minimum_purchase: 100,
  starts_at: new Date()
});
// Emits: discount.created

// Validate discount
try {
  const validDiscount = await discountService.validateDiscount({
    code: 'SUMMER2025',
    cart_total: 200
  });
  // Emits: discount.validated
} catch (error) {
  // Emits: discount.validation_failed
}

// Record usage with transaction safety
await discountService.recordDiscountUsage(discount.id);
// Emits: discount.used
```

## Testing
Comprehensive test suite covering:

### Unit Tests
- Discount creation and validation
- Amount calculations
- Usage tracking
- Error cases:
  - Invalid codes
  - Usage limits
  - Date restrictions
  - Customer eligibility

### Transaction Testing
- Proper usage counting
- Race condition prevention
- Rollback scenarios

## Best Practices
1. Always validate discounts before applying
2. Use transactions for usage tracking
3. Implement proper error handling
4. Keep discount rules simple and clear
5. Document all validation rules
6. Monitor discount usage patterns

## Performance Considerations
- Proper database indexing on discount code
- Caching of active discounts
- Optimized validation checks
- Transaction management for concurrent usage
