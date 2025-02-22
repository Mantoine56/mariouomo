# Gift Cards Module

## Overview
The Gift Cards module provides functionality for creating, managing, and redeeming gift cards within the Mario Uomo e-commerce platform. It supports features such as balance tracking, expiration dates, and comprehensive event tracking for all gift card operations.

## Core Features
- Gift card creation with initial balance
- Gift card redemption with balance tracking
- Automatic expiration handling
- Gift card cancellation
- Event tracking for all operations

## Database Schema

### GiftCard Entity
```typescript
{
  id: string;                 // Unique identifier
  code: string;              // Unique gift card code
  initial_balance: number;    // Original gift card amount
  current_balance: number;    // Remaining balance
  status: GiftCardStatus;    // Active, Redeemed, Cancelled, or Expired
  expires_at?: Date;         // Optional expiration date
  redeemed_at?: Date;        // When the card was first used
  purchaser_id: string;      // User who bought the gift card
  recipient_id?: string;     // Optional recipient user
  created_at: Date;          // Creation timestamp
  updated_at: Date;          // Last update timestamp
}
```

## Events System
The Gift Cards module implements a comprehensive event system for tracking all gift card operations.

### Emitted Events
| Event Name | Description | Payload |
|------------|-------------|---------|
| `gift_card.created` | Emitted when a new gift card is created | Gift card details |
| `gift_card.redeemed` | Emitted when a gift card is used | Gift card and redemption details |
| `gift_card.cancelled` | Emitted when a gift card is cancelled | Gift card details |
| `gift_card.expired` | Emitted when a gift card expires | Gift card details |

## API Endpoints

### Create Gift Card
```typescript
POST /api/gift-cards
Content-Type: application/json

{
  "initial_balance": number,    // Required: Initial balance amount
  "recipient_id": string,      // Optional: ID of recipient user
  "expires_at": Date           // Optional: Expiration date
}
```

### Redeem Gift Card
```typescript
POST /api/gift-cards/redeem
Content-Type: application/json

{
  "code": string,              // Required: Gift card code
  "amount": number             // Required: Amount to redeem
}
```

### Cancel Gift Card
```typescript
POST /api/gift-cards/:id/cancel
```

## Error Handling
The module implements comprehensive error handling for various scenarios:

- Invalid gift card code
- Insufficient balance
- Expired gift card
- Already redeemed gift card
- Invalid redemption amount
- Cancellation of non-active gift card

## Usage Examples

### Creating a Gift Card
```typescript
const giftCard = await giftCardService.create({
  initial_balance: 100,
  recipient_id: 'user-123',
  expires_at: new Date('2025-12-31')
});
```

### Redeeming a Gift Card
```typescript
const redemption = await giftCardService.redeem({
  code: 'GIFT123',
  amount: 50
});
```

## Security Considerations
- Gift card codes are generated using cryptographically secure methods
- All operations are performed within database transactions
- Access control is enforced through proper authorization checks
- Input validation is performed using class-validator

## Testing
The module includes comprehensive test coverage for all operations:

```bash
# Run gift card tests
pnpm test src/modules/gift-cards/tests/
```

## Dependencies
- NestJS for the backend framework
- TypeORM for database operations
- nanoid for secure code generation
- class-validator for DTO validation

## Best Practices
1. Always use transactions for operations that modify gift card state
2. Validate all input using DTOs
3. Handle all errors gracefully
4. Emit appropriate events for all operations
5. Maintain proper audit trails through event logging

## Future Enhancements
- Support for multiple currencies
- Bulk gift card creation
- Gift card transfer between users
- Advanced reporting features
- Integration with loyalty program
