# Payments Module

## Overview
The Payments module handles all payment-related operations in the Mario Uomo e-commerce platform. It provides functionality for processing payments, managing refunds, and tracking payment status across different payment methods.

## Core Features
- Payment processing
- Refund handling
- Payment status tracking
- Multiple payment methods support
- Event-driven architecture
- Comprehensive error handling

## Database Schema

### Payment Entity
```typescript
{
  id: string;                    // Unique identifier
  order_id: string;             // Reference to the order
  amount: number;               // Payment amount
  status: PaymentStatus;        // Current payment status
  method: PaymentMethod;        // Payment method used
  transaction_id?: string;      // External payment provider transaction ID
  provider_reference?: string;  // External payment provider reference
  error_message?: string;       // Error message if payment failed
  provider_response?: object;   // Raw provider response data
  metadata?: object;           // Additional payment metadata
  created_at: Date;            // Creation timestamp
  updated_at: Date;            // Last update timestamp
}
```

## Payment Statuses
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}
```

## Payment Methods
```typescript
enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO = 'crypto'
}
```

## Events System
The Payments module implements a comprehensive event system for tracking all payment operations.

### Emitted Events
| Event Name | Description | Payload |
|------------|-------------|---------|
| `payment.created` | Emitted when a new payment is created | Payment details |
| `payment.processed` | Emitted when a payment is successfully processed | Payment details |
| `payment.failed` | Emitted when a payment fails | Payment details with error |
| `payment.refunded` | Emitted when a payment is refunded | Payment details |

## API Endpoints

### Create Payment
```typescript
POST /api/payments
Content-Type: application/json

{
  "order_id": string,       // Required: Order ID
  "amount": number,         // Required: Payment amount
  "method": PaymentMethod   // Required: Payment method
}
```

### Process Payment
```typescript
POST /api/payments/:id/process
```

### Refund Payment
```typescript
POST /api/payments/:id/refund
```

### Get Payment Details
```typescript
GET /api/payments/:id
```

### Get Order Payments
```typescript
GET /api/payments/order/:orderId
```

## Error Handling
The module implements comprehensive error handling for various scenarios:

- Invalid payment data
- Payment processing failures
- Invalid refund attempts
- Non-existent payments
- Invalid payment status transitions

## Usage Examples

### Creating a Payment
```typescript
const payment = await paymentService.createPayment({
  order_id: 'order-123',
  amount: 100.00,
  method: PaymentMethod.CREDIT_CARD
});
```

### Processing a Payment
```typescript
const processedPayment = await paymentService.processPayment('payment-123');
```

### Refunding a Payment
```typescript
const refundedPayment = await paymentService.refundPayment('payment-123');
```

## Security Considerations
- All monetary operations are performed within database transactions
- Payment status transitions are strictly controlled
- Input validation is performed using class-validator
- Sensitive payment data is never logged
- Payment provider credentials are securely managed

## Testing
The module includes comprehensive test coverage:

```bash
# Run payment tests
pnpm test src/modules/payments/tests/
```

### Test Coverage
- Payment creation
- Payment processing
- Payment refunds
- Error handling
- Event emissions
- Status transitions

## Dependencies
- NestJS for the backend framework
- TypeORM for database operations
- class-validator for DTO validation
- EventEmitter2 for event handling

## Best Practices
1. Always use transactions for payment operations
2. Validate all input data
3. Handle errors gracefully
4. Emit appropriate events
5. Maintain audit trails
6. Follow security guidelines

## Future Enhancements
- Support for additional payment providers
- Subscription payment handling
- Payment analytics and reporting
- Automated refund processing
- Multi-currency support
- Payment fraud detection
