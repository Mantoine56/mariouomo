// Jest setup file

// Explicitly disable New Relic for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.NEW_RELIC_ENABLED = 'false';
process.env.NEW_RELIC_NO_CONFIG_FILE = 'true';
process.env.NEW_RELIC_LOG_ENABLED = 'false';

// Polyfill for crypto which is used by TypeORM in newer versions
const crypto = require('crypto');

// Make crypto available globally
global.crypto = crypto;

// Add any other setup code needed for testing here

console.log('Jest setup complete - crypto polyfill added and New Relic disabled for tests'); 