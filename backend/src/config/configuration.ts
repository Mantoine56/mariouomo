export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Rate Limiting
  THROTTLE_TTL: parseInt(process.env.THROTTLE_TTL || '60', 10),
  THROTTLE_LIMIT: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  
  // Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'debug'),
    maxFiles: process.env.LOG_MAX_FILES || (process.env.NODE_ENV === 'production' ? '14d' : '7d'),
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },

  // HTTP Caching
  httpCache: {
    // Default cache settings by route pattern
    routes: {
      products: {
        maxAge: parseInt(process.env.CACHE_PRODUCTS_MAX_AGE || '3600', 10), // 1 hour
        isPrivate: false,
      },
      categories: {
        maxAge: parseInt(process.env.CACHE_CATEGORIES_MAX_AGE || '7200', 10), // 2 hours
        isPrivate: false,
      },
      user: {
        maxAge: 0, // No caching for user data
        isPrivate: true,
      },
    },
    // Global cache settings
    defaultMaxAge: parseInt(process.env.CACHE_DEFAULT_MAX_AGE || '0', 10),
    defaultIsPrivate: true,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
