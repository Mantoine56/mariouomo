/**
 * Redis Mock Module for NestJS tests
 * 
 * Provides mock implementations of Redis client and cache service
 * for use in integration tests.
 */

/**
 * Create a mock Redis client that simulates Redis operations
 * This can be used for tests that depend on the Redis client
 */
function createMockRedisClient() {
  const cache = new Map();
  
  return {
    // Basic Redis operations
    get: jest.fn((key) => Promise.resolve(cache.get(key) || null)),
    set: jest.fn((key, value, mode, duration) => {
      cache.set(key, value);
      return Promise.resolve('OK');
    }),
    del: jest.fn((key) => {
      const existed = cache.has(key);
      cache.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    exists: jest.fn((key) => Promise.resolve(cache.has(key) ? 1 : 0)),
    expire: jest.fn(() => Promise.resolve(1)),
    ttl: jest.fn(() => Promise.resolve(3600)),
    flushall: jest.fn(() => {
      cache.clear();
      return Promise.resolve('OK');
    }),
    
    // Hash operations
    hget: jest.fn(() => Promise.resolve(null)),
    hset: jest.fn(() => Promise.resolve(1)),
    hgetall: jest.fn(() => Promise.resolve({})),
    hdel: jest.fn(() => Promise.resolve(0)),
    
    // List operations
    lpush: jest.fn(() => Promise.resolve(1)),
    rpush: jest.fn(() => Promise.resolve(1)),
    lrange: jest.fn(() => Promise.resolve([])),
    
    // Connection management
    quit: jest.fn(() => Promise.resolve('OK')),
    
    // For tracking calls in tests
    _cache: cache,
  };
}

/**
 * Create a mock cache service that uses the Redis client mock
 */
function createMockCacheService() {
  const redisClient = createMockRedisClient();
  
  return {
    get: jest.fn((key) => redisClient.get(key)),
    set: jest.fn((key, value, ttl) => redisClient.set(key, value, 'EX', ttl || 3600)),
    del: jest.fn((key) => redisClient.del(key)),
    reset: jest.fn(() => redisClient.flushall()),
    wrap: jest.fn((key, factory, ttl) => {
      return redisClient.get(key).then(cached => {
        if (cached) return JSON.parse(cached);
        return Promise.resolve(factory())
          .then(result => {
            redisClient.set(key, JSON.stringify(result), 'EX', ttl || 3600);
            return result;
          });
      });
    }),
    store: {
      keys: jest.fn(() => Promise.resolve(Array.from(redisClient._cache.keys()))),
    },
    cacheManager: {
      store: {
        getClient: jest.fn(() => redisClient),
      },
    },
  };
}

/**
 * Get providers for the Redis mock module
 * These can be used in the NestJS test module setup
 */
function getRedisMockProviders() {
  const redisClient = createMockRedisClient();
  const cacheService = createMockCacheService();
  
  return [
    {
      provide: 'REDIS_CLIENT',
      useValue: redisClient,
    },
    {
      provide: 'CACHE_MANAGER',
      useValue: cacheService,
    },
    {
      provide: 'CacheService',
      useValue: cacheService,
    },
  ];
}

module.exports = {
  createMockRedisClient,
  createMockCacheService,
  getRedisMockProviders,
}; 