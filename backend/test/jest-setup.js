// Jest setup file

// Polyfill for crypto which is used by TypeORM in newer versions
const crypto = require('crypto');

// Make crypto available globally
global.crypto = crypto;

// Add any other setup code needed for testing here

console.log('Jest setup complete - crypto polyfill added'); 