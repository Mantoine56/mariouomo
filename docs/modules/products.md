# Products Module Documentation

## Overview
The Products module handles all product-related functionality in the Mario Uomo e-commerce platform. It provides robust product management capabilities including full-text search, variant management, and caching strategies.

## Architecture

### Key Components

#### 1. Product Service (`ProductService`)
The core service handling product operations with the following features:
- Full-text search using TypeORM
- Product variant management
- Caching with Redis
- Soft delete support

```typescript
interface IProductService {
  createProduct(dto: CreateProductDto): Promise<Product>;
  updateProduct(id: string, dto: UpdateProductDto): Promise<Product>;
  getProduct(id: string): Promise<Product>;
  searchProducts(search: SearchProductsDto, pagination: PaginationQueryDto): Promise<Product[]>;
  deleteProduct(id: string): Promise<void>;
}
```

#### 2. Product Repository (`ProductRepository`)
Custom repository extending TypeORM's repository pattern with specialized queries:
- Full-text search implementation
- Efficient joins for variants and categories
- Pagination support
- Cache-aware operations

#### 3. DTOs
- `CreateProductDto`: Product creation with variants
- `UpdateProductDto`: Partial updates
- `SearchProductsDto`: Search parameters with sorting
- `ProductResponseDto`: API response formatting

### Caching Strategy
- Product details cached for 1 hour
- Search results cached with composite keys
- Automatic cache invalidation on updates
- Pattern-based cache clearing

## API Endpoints

### Search Products
```http
GET /api/products/search
```
Query Parameters:
- `query`: Search text
- `categories`: Category filters
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sortBy`: Sort field (name, price, createdAt, updatedAt)
- `sortOrder`: ASC or DESC
- `page`: Page number
- `limit`: Items per page

### Get Product
```http
GET /api/products/:id
```
Returns detailed product information including:
- Basic details
- Variants
- Categories
- Images
- Inventory status

### Create Product
```http
POST /api/products
```
Protected endpoint requiring admin privileges.
Accepts product data with variants in JSON format.

### Update Product
```http
PATCH /api/products/:id
```
Protected endpoint for partial updates.

### Delete Product
```http
DELETE /api/products/:id
```
Protected endpoint performing soft delete.

## Full-Text Search Implementation

The product search uses PostgreSQL's full-text search capabilities:

```sql
CREATE INDEX products_search_idx ON products USING GIN (
  to_tsvector('english',
    coalesce(name,'') || ' ' ||
    coalesce(description,'') || ' ' ||
    coalesce(brand,'')
  )
);
```

Search query example:
```typescript
const searchQuery = this.productRepository
  .createQueryBuilder('product')
  .where(
    "to_tsvector('english', product.name || ' ' || product.description) @@ plainto_tsquery('english', :query)",
    { query }
  );
```

## Error Handling

All operations implement proper error handling:
- Validation errors (400)
- Not found errors (404)
- Authorization errors (403)
- Server errors (500)

Example error response:
```json
{
  "statusCode": 400,
  "message": "Invalid product data",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

## Testing

### Unit Tests
- Service methods
- Repository queries
- DTO validation
- Cache operations

### Integration Tests
- API endpoints
- Database operations
- Cache interactions

### E2E Tests
- Search functionality
- CRUD operations
- Error scenarios

## Performance Considerations

1. **Caching**
   - Product details cached
   - Search results cached
   - Cache invalidation on updates

2. **Database**
   - Optimized indexes
   - Efficient joins
   - Pagination

3. **Search**
   - Full-text search index
   - Efficient filtering
   - Sort optimization

## Security

1. **Authorization**
   - Role-based access
   - JWT validation
   - Rate limiting

2. **Data Validation**
   - Input sanitization
   - Type validation
   - Business rule validation

3. **Error Handling**
   - Secure error messages
   - Proper status codes
   - Audit logging

## Monitoring

The module includes comprehensive monitoring:
- Cache hit/miss rates
- Search performance metrics
- Error rates
- Response times

## Future Improvements

1. **Search Enhancement**
   - Elasticsearch integration
   - Fuzzy matching
   - Relevance scoring

2. **Caching**
   - Cache warming
   - Selective invalidation
   - Cache statistics

3. **Performance**
   - Query optimization
   - Index tuning
   - Batch operations
