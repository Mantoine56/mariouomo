/**
 * Cache configuration for the application.
 * This provides default HTTP caching settings for different routes.
 */
export const cacheConfig = {
  // Default HTTP cache settings
  httpCache: {
    defaultMaxAge: 3600, // 1 hour in seconds
    defaultIsPrivate: false,
    // Route-specific cache settings
    routes: {
      // Public data with longer cache times
      products: {
        maxAge: 7200, // 2 hours
        isPrivate: false,
      },
      categories: {
        maxAge: 14400, // 4 hours
        isPrivate: false,
      },
      // User-specific data with shorter cache times
      users: {
        maxAge: 300, // 5 minutes
        isPrivate: true,
      },
      orders: {
        maxAge: 60, // 1 minute
        isPrivate: true,
      },
      // Analytics data with medium cache times
      analytics: {
        maxAge: 1800, // 30 minutes
        isPrivate: true,
      }
    }
  },
  
  // Redis cache settings (for data caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production',
    retryStrategy: (times: number) => Math.min(times * 50, 2000)
  }
};

/**
 * Get cache configuration
 */
export const getCacheConfig = () => {
  return cacheConfig;
}; 