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
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
