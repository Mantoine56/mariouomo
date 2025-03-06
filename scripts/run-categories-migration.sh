#!/bin/bash

# Script to run the categories migration
# This will create the necessary tables for the categories endpoint

# Set environment variables
export NODE_ENV=development

# Navigate to the backend directory
cd "$(dirname "$0")/../backend"

# Run the migration
echo "Running categories migration..."
npx typeorm migration:run -d src/config/typeorm.config.ts

# Verify migration
echo "Verifying migration..."
psql -h localhost -U postgres -d mariouomo -c "SELECT COUNT(*) FROM categories;"
psql -h localhost -U postgres -d mariouomo -c "SELECT COUNT(*) FROM categories_closure;"
psql -h localhost -U postgres -d mariouomo -c "SELECT COUNT(*) FROM product_categories;"

echo "Migration completed successfully!"
