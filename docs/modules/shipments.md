# Shipments Module

The Shipments module handles all shipping-related functionality in the Mario Uomo e-commerce platform, including creating shipments, tracking packages, and managing delivery status updates.

## Features

- Create new shipments with validated shipping details
- Track shipment status and history
- Support for multiple shipping providers (FedEx, UPS, USPS, DHL)
- Package dimension and weight tracking
- Estimated delivery date management

## Data Transfer Objects (DTOs)

### CreateShipmentDto

Used for creating new shipments with the following validated fields:

- `order_id` (UUID): Associated order ID
- `shipping_provider` (string): One of 'FedEx', 'UPS', 'USPS', 'DHL'
- `tracking_number` (string): Provider's tracking number
- `estimated_delivery_date` (Date): Must be a future date
- `package_details`: Object containing:
  - `weight` (number): Package weight (> 0)
  - `weight_unit` (string): Either 'kg' or 'lb'
  - `dimensions`: Object containing:
    - `length` (number): Package length (> 0)
    - `width` (number): Package width (> 0)
    - `height` (number): Package height (> 0)
    - `unit` (string): Either 'cm' or 'in'

### UpdateShipmentStatusDto

Used for updating shipment status with tracking history:

- `status` (ShipmentStatus): Current shipment status
- `tracking_history`: Array of tracking entries containing:
  - `timestamp` (string): ISO date string
  - `status` (string): Status description
  - `location` (string): Current location
  - `description` (string): Detailed status description

## Validation Rules

The module implements strict validation rules:

1. Order ID must be a valid UUID
2. Shipping provider must be one of the supported providers
3. Estimated delivery date must be in the future
4. All package dimensions must be positive numbers
5. Weight and dimension units must use supported values
6. All tracking history entries must include required fields

## Events

The module emits events for important shipment lifecycle changes:

- `ShipmentCreatedEvent`: When a new shipment is created
- `ShipmentStatusUpdatedEvent`: When shipment status changes
- `ShipmentDeletedEvent`: When a shipment is cancelled/deleted

## Testing

The module includes comprehensive test coverage:

1. **Validation Tests** (`shipment.validation.spec.ts`):
   - Validates proper field formats and required fields
   - Tests invalid input handling
   - Ensures date validation for delivery estimates

2. **Event Tests** (`shipment.events.spec.ts`):
   - Verifies proper event emission
   - Tests event payload structure
   - Ensures event handlers receive correct data

3. **Service Tests** (`shipment.service.spec.ts`):
   - Tests shipment creation and updates
   - Verifies status transitions
   - Tests error handling and edge cases

## Usage Example

```typescript
// Creating a new shipment
const shipmentDto = {
  order_id: '123e4567-e89b-12d3-a456-426614174000',
  shipping_provider: 'FedEx',
  tracking_number: 'TRACK123',
  estimated_delivery_date: new Date('2025-03-01'),
  package_details: {
    weight: 2.5,
    weight_unit: 'kg',
    dimensions: {
      length: 30,
      width: 20,
      height: 10,
      unit: 'cm'
    }
  }
};

// Updating shipment status
const statusUpdate = {
  status: ShipmentStatus.SHIPPED,
  tracking_history: [{
    timestamp: new Date().toISOString(),
    status: 'shipped',
    location: 'Warehouse',
    description: 'Package has left the warehouse'
  }]
};
```

## Future Improvements

1. Add support for additional shipping providers
2. Implement real-time tracking updates
3. Add shipping cost calculation
4. Implement address validation
5. Add support for international shipping requirements
