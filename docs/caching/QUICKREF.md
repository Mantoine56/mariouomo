# Cache Usage Quick Reference

## Common Caching Patterns

### 1. Basic Cache Usage

```typescript
// Cache a simple value with TTL
async function cacheValue(key: string, value: any): Promise<void> {
  // Convert value to string and set with 1-hour expiration
  await redis.set(key, JSON.stringify(value), 'EX', 3600);
}

// Retrieve cached value with type safety
async function getCachedValue<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

### 2. Cache-Aside Pattern

```typescript
/**
 * Get product with cache-aside pattern
 * @param id - Product ID to fetch
 * @returns Product or null if not found
 */
async function getProduct(id: string): Promise<Product | null> {
  // Try cache first
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    // Cache hit - return parsed data
    return JSON.parse(cached);
  }
  
  // Cache miss - get from database
  const product = await db.findProduct(id);
  if (product) {
    // Store in cache for future requests
    await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);
  }
  
  return product;
}
```

### 3. Batch Operations

```typescript
/**
 * Get multiple products efficiently using batch operations
 * @param ids - Array of product IDs to fetch
 * @returns Array of products in same order as IDs
 */
async function getProducts(ids: string[]): Promise<Product[]> {
  // Generate cache keys
  const cacheKeys = ids.map(id => `product:${id}`);
  
  // Get all cached values in single operation
  const cachedValues = await redis.mget(...cacheKeys);
  
  // Find which products we need to fetch from DB
  const missingIndices = cachedValues.reduce<number[]>((acc, val, idx) => {
    if (!val) acc.push(idx);
    return acc;
  }, []);
  
  if (missingIndices.length === 0) {
    // All products were cached
    return cachedValues.map(v => JSON.parse(v!));
  }
  
  // Fetch missing products from database
  const missingIds = missingIndices.map(idx => ids[idx]);
  const dbProducts = await db.findProducts(missingIds);
  
  // Cache missing products
  const cacheOps = dbProducts.map(product => 
    redis.set(`product:${product.id}`, JSON.stringify(product), 'EX', 3600)
  );
  await Promise.all(cacheOps);
  
  // Merge cached and database results
  return ids.map((id, idx) => {
    if (cachedValues[idx]) {
      return JSON.parse(cachedValues[idx]!);
    }
    return dbProducts.find(p => p.id === id)!;
  });
}
```

### 4. Cache Invalidation

```typescript
/**
 * Invalidate product cache and related caches
 * @param productId - ID of product to invalidate
 * @param categoryId - Category ID for related cache invalidation
 */
async function invalidateProductCache(
  productId: string,
  categoryId: string
): Promise<void> {
  // Create multi command for atomic operations
  const multi = redis.multi();
  
  // Delete direct product cache
  multi.del(`product:${productId}`);
  
  // Delete category product list cache
  multi.del(`category:${categoryId}:products`);
  
  // Delete any search results containing this product
  const searchKeys = await redis.keys('search:products:*');
  if (searchKeys.length > 0) {
    multi.del(...searchKeys);
  }
  
  // Execute all operations atomically
  await multi.exec();
}
```

## Common Cache Keys

```typescript
// Product-related keys
product:${id}                 // Single product
products:page:${num}          // Product list page
category:${id}:products       // Products in category
search:products:${query}      // Search results

// User-related keys
user:${id}:cart              // User's cart
user:${id}:preferences       // User preferences
session:${id}                // User session

// Category-related keys
categories:all               // All categories
category:${id}              // Single category
categories:tree             // Category hierarchy
```

## TTL Guidelines

```typescript
const TTL = {
  PRODUCT: 3600,           // 1 hour
  CATEGORY: 86400,         // 24 hours
  SEARCH: 1800,            // 30 minutes
  USER_CART: 604800,       // 7 days
  SESSION: 86400,          // 24 hours
  TEMPORARY: 300           // 5 minutes
} as const;
```

## Error Handling

```typescript
/**
 * Safely get cached value with fallback
 * @param key - Cache key to retrieve
 * @param fallback - Function to call on cache miss
 * @returns Retrieved or fallback value
 */
async function getCacheWithFallback<T>(
  key: string,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // Log cache error but don't fail
    logger.error('Cache read error:', error);
  }
  
  // Get fresh data
  const data = await fallback();
  
  try {
    // Try to cache for next time
    await redis.set(key, JSON.stringify(data), 'EX', 3600);
  } catch (error) {
    // Log cache write error but don't fail
    logger.error('Cache write error:', error);
  }
  
  return data;
}
```

## Monitoring

```typescript
/**
 * Track cache operations for monitoring
 * @param operation - Type of operation performed
 * @param success - Whether operation succeeded
 * @param duration - Operation duration in ms
 */
function trackCacheOperation(
  operation: 'get' | 'set' | 'del',
  success: boolean,
  duration: number
): void {
  metrics.increment(`cache.${operation}`, { success });
  metrics.timing(`cache.${operation}.duration`, duration);
}

// Usage example
async function getCachedProduct(id: string): Promise<Product | null> {
  const start = Date.now();
  try {
    const result = await redis.get(`product:${id}`);
    trackCacheOperation('get', true, Date.now() - start);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    trackCacheOperation('get', false, Date.now() - start);
    throw error;
  }
}
```

## Best Practices Summary

1. **Key Design**
   - Use consistent prefixes
   - Include version if needed
   - Keep keys readable
   - Use colon separators

2. **TTL Strategy**
   - Match data volatility
   - Use constants for TTLs
   - Consider cache warming
   - Implement TTL jitter

3. **Error Handling**
   - Never fail on cache errors
   - Log cache issues
   - Have fallbacks ready
   - Monitor error rates

4. **Performance**
   - Use batch operations
   - Compress large values
   - Monitor memory usage
   - Track hit rates
