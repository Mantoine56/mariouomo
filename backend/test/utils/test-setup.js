// Setup for Jest test environment

// Fix for "crypto is not defined" error in Jest
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

// Add any other global test setup here 