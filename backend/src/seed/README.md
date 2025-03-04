# Database Seed Module for Mario Uomo

This module provides functionality to seed the database with realistic test data for the Mario Uomo e-commerce platform.

## Purpose

The seed module is designed to:

1. Generate a complete test dataset for the analytics dashboard
2. Create realistic historical order data over a 90-day period
3. Populate all necessary related entities (products, variants, profiles, etc.)
4. Create patterns in the data that make analytics meaningful

## Usage

### Prerequisites

Ensure your database is properly configured in your environment variables.

### Installation

The module is included in the project dependencies. Run the following to install dependencies:

```bash
cd backend
pnpm install
```

### Running the Seed Command

To populate your database with test data:

```bash
cd backend
pnpm run seed
```

This will:
- Create a sample store
- Generate 25 products across 5 categories with variants
- Create 100 customer profiles
- Generate 500-1000 historical orders across a 90-day period
- Set up realistic inventory levels

### Data Generated

The seed script creates the following data:

#### Store
- A main store with contact information and settings

#### Products
- 25 luxury products across 5 categories (Shoes, Clothing, Accessories, Equipment, Electronics)
- Each product has 1-3 variants with different sizes/colors
- Product images linked to each product

#### Profiles
- 100 customer profiles with contact information and preferences

#### Orders
- 500-1000 historical orders over a 90-day period
- Varying order statuses (delivered, processing, shipped, cancelled)
- Realistic pricing with taxes, shipping, and occasional discounts

#### Inventory
- Inventory records for each product variant
- Quantities adjusted based on order history

## Notes

- Running the seed command will not delete existing data. However, if you run it multiple times, you may create duplicate test entities.
- The data is designed to provide meaningful analytics for the dashboard.
- All generated IDs use UUID format for compatibility with the production schema.
- The seed script adds metadata with additional information that may be useful for extended features.

## Support

For issues or questions about the seed module, please contact the development team. 