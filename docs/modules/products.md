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

#### 4. Image Service (`ImageService`)
Handles all image-related operations including:
- Image upload and processing
- Thumbnail generation
- CDN integration
- Image optimization

```typescript
interface IImageService {
  uploadProductImage(file: Buffer, productId: string): Promise<{
    originalUrl: string;
    thumbnailUrl: string;
  }>;
  deleteImage(imageUrl: string): Promise<void>;
}
```

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

### Upload Product Image
```http
POST /api/products/:id/images
Content-Type: multipart/form-data

file: <image_file>
```

Response:
```json
{
  "originalUrl": "https://cdn.mariouomo.com/products/123/image.jpg",
  "thumbnailUrl": "https://cdn.mariouomo.com/products/123/image-thumb.jpg"
}
```

### Delete Product Image
```http
DELETE /api/products/:id/images/:imageId
```

Response:
```json
{
  "message": "Image deleted successfully"
}
```

## Variant Management

### Variant Service (`VariantService`)
Handles all variant-related operations including:
- CRUD operations for variants
- Inventory tracking
- SKU management
- Low stock alerts

```typescript
interface IVariantService {
  createVariant(dto: CreateVariantDto): Promise<ProductVariant>;
  updateVariant(id: string, dto: UpdateVariantDto): Promise<ProductVariant>;
  deleteVariant(id: string): Promise<void>;
  updateInventory(id: string, quantity: number): Promise<ProductVariant>;
  getVariantById(id: string): Promise<ProductVariant>;
  getProductVariants(productId: string): Promise<ProductVariant[]>;
}
```

### Variant Features
- **Attributes Management**
  - Dynamic attribute support (size, color, etc.)
  - Flexible attribute schema
  - Validation rules

- **Inventory Tracking**
  - Real-time quantity updates
  - Low stock alerts
  - Inventory history

- **Pricing**
  - Variant-specific pricing
  - Bulk pricing support
  - Price history tracking

### API Endpoints

#### Create Variant
```http
POST /api/variants
Content-Type: application/json

{
  "productId": "uuid",
  "sku": "SKU123",
  "price": 29.99,
  "attributes": [
    {
      "name": "size",
      "value": "large"
    },
    {
      "name": "color",
      "value": "blue"
    }
  ],
  "quantity": 100,
  "lowStockThreshold": 10
}
```

#### Update Variant
```http
PUT /api/variants/:id
Content-Type: application/json

{
  "price": 34.99,
  "quantity": 150
}
```

#### Update Inventory
```http
PUT /api/variants/:id/inventory
Content-Type: application/json

{
  "quantity": 75
}
```

#### Get Product Variants
```http
GET /api/variants/product/:productId
```

### Data Model

```typescript
interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  attributes: {
    name: string;
    value: string;
  }[];
  quantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}
```

### Error Handling

- **Validation Errors (400)**
  - Invalid SKU format
  - Duplicate SKU
  - Invalid price
  - Invalid quantity

- **Not Found Errors (404)**
  - Variant not found
  - Product not found

- **Authorization Errors (403)**
  - Insufficient permissions

### Inventory Management

- **Low Stock Alerts**
  - Configurable thresholds
  - Email notifications
  - Dashboard alerts

- **Stock Updates**
  - Batch updates
  - Audit logging
  - History tracking

### Security

- Role-based access control
- Input validation
- SKU uniqueness enforcement
- Audit logging

## Category Management

### Overview
The category management system provides a hierarchical tree structure for organizing products. It features:
- Tree-based category organization
- Redis caching for fast retrieval
- Proper validation and error handling
- Support for category movement and reordering

### Key Components

#### 1. Category Service (`CategoryService`)
Handles all category-related operations with the following features:
- CRUD operations for categories
- Tree structure management
- Redis-based caching
- Parent-child relationship handling

```typescript
interface ICategoryService {
  createCategory(dto: CreateCategoryDto): Promise<Category>;
  updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  moveCategory(id: string, dto: MoveCategoryDto): Promise<Category>;
  getCategoryTree(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  getCategoryBySlug(slug: string): Promise<Category>;
}
```

#### 2. Category Repository
Extends TypeORM's TreeRepository for efficient tree operations:
- Tree structure querying
- Hierarchical data management
- Efficient ancestor/descendant lookups

#### 3. DTOs
- `CreateCategoryDto`: Category creation with optional parent
- `UpdateCategoryDto`: Partial category updates
- `MoveCategoryDto`: Category position management

### Caching Strategy
- Category tree cached with 1-hour TTL
- Automatic cache invalidation on updates
- Efficient tree serialization/deserialization
- Date handling for cached objects

### API Endpoints

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Men's Clothing",
  "slug": "mens-clothing",
  "description": "Men's clothing collection",
  "parentId": "uuid" // optional
}
```

Response:
```json
{
  "id": "uuid",
  "name": "Men's Clothing",
  "slug": "mens-clothing",
  "description": "Men's clothing collection",
  "path": "Clothing > Men's Clothing",
  "position": 0,
  "isVisible": true,
  "totalProducts": 0,
  "children": []
}
```

#### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Move Category
```http
PUT /api/categories/:id/move
Content-Type: application/json

{
  "parentId": "uuid",
  "position": 1
}
```

#### Get Category Tree
```http
GET /api/categories/tree
```

Returns the complete category hierarchy with proper caching.

#### Delete Category
```http
DELETE /api/categories/:id
```

Performs validation before deletion:
- Checks for existing children
- Verifies no associated products
- Maintains tree integrity

### Error Handling
- Duplicate slug detection
- Parent category validation
- Tree integrity checks
- Proper error messages

### Testing
Comprehensive test suite covering:
- CRUD operations
- Tree structure management
- Cache operations
- Error scenarios

## Image Handling

### Image Processing
- Original images are resized to max 1200x1200px
- Thumbnails are generated at 300x300px
- JPEG optimization with 80% quality
- Progressive loading support

### CDN Integration
- Images are stored in S3
- Served through CloudFront CDN
- Cache-Control headers for optimal caching
- Public URLs for easy access

### Security
- Secure file upload validation
- Content-Type verification
- Size limits enforcement
- Proper ACL settings

### Error Handling
- Validation errors (400)
- Processing errors (400)
- Storage errors (500)
- Detailed error messages

Example usage:
```typescript
// Upload image
const { originalUrl, thumbnailUrl } = await imageService.uploadProductImage(
  fileBuffer,
  productId
);

// Delete image
await imageService.deleteImage(imageUrl);
```

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
