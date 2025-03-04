# Database Seed Scripts

This directory contains scripts for seeding the database with test data for development and testing purposes.

## Analytics Seed

The analytics seed script generates realistic data for testing the analytics API endpoints. It creates:

- Product categories
- Products with variants and images
- User profiles
- Historical orders with order items

This data is essential for testing the analytics dashboard and API integration.

## Usage

To run the seed script:

```bash
# From the project root
cd backend

# Run the seed command
pnpm run nest start --entryFile seed/seed-command
```

## Generated Data

The seed script generates:

- 5 product categories (Shoes, Clothing, Accessories, Equipment, Electronics)
- 25 products (5 in each category)
- 100 user profiles
- 500-1000 orders with varying statuses and dates

## Important Notes

1. **This is for development only** - Never run seed scripts in production environments.
2. **Data is randomized** - Each run will generate different data with realistic patterns.
3. **Existing data** - The script does not clear existing data, so you may want to clear your database before running it.

## Customization

You can modify the `analytics-seed.ts` file to:

- Change the number of products, users, or orders
- Adjust the date ranges for historical data
- Modify the product categories and sample products
- Change the pricing or discount patterns

## Troubleshooting

If you encounter errors when running the seed script:

1. Make sure your database is running and accessible
2. Check that all required entities are properly imported in the seed module
3. Verify that your database schema matches the entity definitions
4. Check for any constraint violations in your database logs 