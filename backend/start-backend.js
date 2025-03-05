/**
 * Custom startup script for the backend server
 * This bypasses the New Relic dependency
 */

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = 3001;

// Provide crypto globally
global.crypto = require('crypto');

// Disable New Relic
process.env.NEW_RELIC_ENABLED = false;
process.env.NEW_RELIC_NO_CONFIG_FILE = true;

// Start the application
console.log('Starting backend server on port 3001...');
require('./dist/main'); 