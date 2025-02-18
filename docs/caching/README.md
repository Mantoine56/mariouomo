# Cache Usage Guidelines

This guide provides comprehensive guidelines for implementing and using caching effectively in the Mario Uomo platform.

## Caching Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───►│   API       │───►│   Redis     │
│             │◄───│   Server    │◄───│   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   ▲
                          ▼                   │
                    ┌─────────────┐    ┌─────────────┐
                    │  Database   │───►│   Cache     │
                    │             │    │  Invalidator │
                    └─────────────┘    └─────────────┘
```

## Cache Configuration

### 1. Redis Setup

```typescript
// src/config/cache.config.ts
export const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production',
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => Math.min(times * 50, 2000)
  },
  defaultTTL: 3600, // 1 hour
  keyPrefix: 'mario:',
  scan: {
    count: 100,
    match: 'mario:*'
  }
};
```

### 2. Cache Keys

```typescript
// src/common/constants/cache-keys.ts
export const CacheKeys = {
  // Product-related keys
  PRODUCT: {
    DETAIL: (id: string) => `product:${id}`,
    LIST: (page: number, limit: number) => `products:${page}:${limit}`,
    CATEGORY: (categoryId: string) => `products:category:${categoryId}`,
    SEARCH: (query: string) => `products:search:${query}`
  },
  
  // Category-related keys
  CATEGORY: {
    ALL: 'categories:all',
    TREE: 'categories:tree',
    DETAIL: (id: string) => `category:${id}`
  },
  
  // User-related keys
  USER: {
    PROFILE: (id: string) => `user:${id}`,
    PREFERENCES: (id: string) => `user:${id}:preferences`,
    CART: (id: string) => `user:${id}:cart`
  }
};
```

## Caching Strategies

### 1. Cache-Aside (Lazy Loading)

```typescript
// src/services/product.service.ts
export class ProductService {
  async getProduct(id: string): Promise<Product> {
    // Try cache first
    const cacheKey = CacheKeys.PRODUCT.DETAIL(id);
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss, get from database
    const product = await this.productRepo.findOne(id);
    if (product) {
      // Store in cache with TTL
      await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);
    }
    
    return product;
  }
}
```

### 2. Write-Through

```typescript
// src/services/product.service.ts
export class ProductService {
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    // Update database
    const product = await this.productRepo.update(id, data);
    
    // Update cache
    const cacheKey = CacheKeys.PRODUCT.DETAIL(id);
    await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);
    
    // Invalidate related caches
    await this.invalidateRelatedCaches(product);
    
    return product;
  }
  
  private async invalidateRelatedCaches(product: Product): Promise<void> {
    const keys = [
      CacheKeys.PRODUCT.LIST('*', '*'),
      CacheKeys.PRODUCT.CATEGORY(product.categoryId)
    ];
    
    await this.redis.del(...keys);
  }
}
```

### 3. Cache Prewarming

```typescript
// src/tasks/cache-warmer.service.ts
@Injectable()
export class CacheWarmerService {
  @Cron('0 */6 * * *') // Every 6 hours
  async warmProductCache(): Promise<void> {
    // Get popular products
    const popularProducts = await this.productRepo.findPopular();
    
    // Warm cache in parallel
    await Promise.all(
      popularProducts.map(async (product) => {
        const cacheKey = CacheKeys.PRODUCT.DETAIL(product.id);
        await this.redis.set(
          cacheKey,
          JSON.stringify(product),
          'EX',
          3600
        );
      })
    );
  }
}
```

## Cache Invalidation

### 1. Time-Based Invalidation

```typescript
// src/decorators/cache.decorator.ts
export function Cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      const result = await originalMethod.apply(this, args);
      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', ttl);
      
      return result;
    };
    
    return descriptor;
  };
}
```

### 2. Event-Based Invalidation

```typescript
// src/events/product.events.ts
@Injectable()
export class ProductEventHandler {
  @OnEvent('product.updated')
  async handleProductUpdate(payload: ProductUpdatedEvent): Promise<void> {
    // Invalidate direct cache
    const productKey = CacheKeys.PRODUCT.DETAIL(payload.productId);
    await this.redis.del(productKey);
    
    // Invalidate list caches
    const listPattern = CacheKeys.PRODUCT.LIST('*', '*');
    const keys = await this.redis.keys(listPattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Invalidate category caches
    const categoryKey = CacheKeys.PRODUCT.CATEGORY(payload.categoryId);
    await this.redis.del(categoryKey);
  }
}
```

### 3. Pattern-Based Invalidation

```typescript
// src/services/cache-invalidator.service.ts
@Injectable()
export class CacheInvalidatorService {
  async invalidateByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let keys: string[] = [];
    
    // Scan for matching keys
    do {
      const [nextCursor, matchedKeys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      
      cursor = nextCursor;
      keys = keys.concat(matchedKeys);
    } while (cursor !== '0');
    
    // Delete matched keys
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    return keys.length;
  }
}
```

## Performance Optimization

### 1. Compression

```typescript
// src/utils/cache.utils.ts
export class CacheUtils {
  static async setCompressed(
    redis: Redis,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    const compressed = await gzip(JSON.stringify(value));
    
    if (ttl) {
      await redis.set(key, compressed, 'EX', ttl);
    } else {
      await redis.set(key, compressed);
    }
  }
  
  static async getCompressed<T>(redis: Redis, key: string): Promise<T | null> {
    const compressed = await redis.get(key);
    if (!compressed) return null;
    
    const decompressed = await gunzip(compressed);
    return JSON.parse(decompressed.toString());
  }
}
```

### 2. Batch Operations

```typescript
// src/services/product.service.ts
export class ProductService {
  async getProducts(ids: string[]): Promise<Product[]> {
    // Get from cache in single operation
    const cacheKeys = ids.map(id => CacheKeys.PRODUCT.DETAIL(id));
    const cachedProducts = await this.redis.mget(...cacheKeys);
    
    // Find missing products
    const missingIds = ids.filter((_, index) => !cachedProducts[index]);
    
    if (missingIds.length > 0) {
      const products = await this.productRepo.findByIds(missingIds);
      
      // Cache missing products
      await Promise.all(
        products.map(product =>
          this.redis.set(
            CacheKeys.PRODUCT.DETAIL(product.id),
            JSON.stringify(product),
            'EX',
            3600
          )
        )
      );
      
      // Merge cached and database results
      return ids.map((id, index) => {
        if (cachedProducts[index]) {
          return JSON.parse(cachedProducts[index]);
        }
        return products.find(p => p.id === id);
      });
    }
    
    return cachedProducts.map(p => JSON.parse(p));
  }
}
```

## Monitoring and Metrics

### 1. Cache Hit Rate

```typescript
// src/interceptors/cache-metrics.interceptor.ts
@Injectable()
export class CacheMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const cacheKey = this.getCacheKey(context);
    
    return from(this.redis.get(cacheKey)).pipe(
      switchMap(cached => {
        if (cached) {
          // Cache hit
          this.metrics.incrementCounter('cache_hits', { key: cacheKey });
          return of(JSON.parse(cached));
        }
        
        // Cache miss
        this.metrics.incrementCounter('cache_misses', { key: cacheKey });
        return next.handle().pipe(
          tap(data => {
            this.redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
          })
        );
      }),
      tap(() => {
        const duration = Date.now() - start;
        this.metrics.recordTiming('cache_operation_duration', duration);
      })
    );
  }
}
```

### 2. Memory Usage

```typescript
// src/services/cache-monitor.service.ts
@Injectable()
export class CacheMonitorService {
  @Cron('*/5 * * * *') // Every 5 minutes
  async monitorCacheHealth(): Promise<void> {
    const info = await this.redis.info();
    
    // Record metrics
    this.metrics.gauge('cache_memory_used', info.used_memory);
    this.metrics.gauge('cache_memory_peak', info.used_memory_peak);
    this.metrics.gauge('cache_keys_total', info.keys);
    
    // Check memory usage
    const memoryUsagePercent = (info.used_memory / info.maxmemory) * 100;
    if (memoryUsagePercent > 80) {
      this.logger.warn(`High cache memory usage: ${memoryUsagePercent}%`);
    }
  }
}
```

## Best Practices

### 1. Key Design
- Use consistent naming conventions
- Include version in keys for schema changes
- Keep keys short but descriptive
- Use colon (:) as namespace separator

### 2. TTL Strategy
- Set appropriate TTLs based on data volatility
- Use shorter TTLs for frequently changing data
- Consider infinite TTL for static data
- Implement TTL jitter to prevent thundering herd

### 3. Error Handling
- Implement circuit breakers for cache failures
- Gracefully handle cache misses
- Log cache errors for monitoring
- Have fallback strategies ready

### 4. Security
- Enable Redis authentication
- Use SSL/TLS in production
- Implement key access controls
- Regular security audits

## Common Pitfalls

1. **Cache Stampede**
   - Implement stale-while-revalidate pattern
   - Use probabilistic early expiration
   - Implement distributed locks for cache warming

2. **Memory Issues**
   - Monitor memory usage
   - Implement proper eviction policies
   - Use compression for large values
   - Regular cache cleanup

3. **Inconsistency**
   - Implement proper invalidation strategies
   - Use write-through when necessary
   - Monitor cache hit rates
   - Regular data validation

## Support and Maintenance

### 1. Monitoring
- Set up alerts for cache issues
- Monitor hit rates and memory usage
- Track cache operation latency
- Regular performance audits

### 2. Troubleshooting
- Check cache connectivity
- Verify key existence
- Monitor eviction rates
- Analyze cache patterns

### 3. Optimization
- Regular cache analysis
- Performance tuning
- Capacity planning
- Cache warming strategies
