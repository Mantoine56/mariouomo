/** @type {import('jest').Config} */
const config = {
  // Use node environment for backend tests
  testEnvironment: 'node',
  
  // Define root directories for tests and source code
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  
  // Match both TypeScript and JavaScript test files
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Configure transformers for TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  
  // Longer timeout for integration tests
  testTimeout: 30000,
  
  // Setup files to run before tests
  setupFiles: ['<rootDir>/test/jest-setup.js'],
  
  // Configure code coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts',
  ],
  
  // Configuration to properly detect open handles in integration tests
  detectOpenHandles: true,
  
  // Setup files to run after environment is set up 
  setupFilesAfterEnv: [
    '<rootDir>/test/jest-setup-after-env.js',
  ],

  // Configure test environment variables
  testEnvironmentOptions: {
    // Set NODE_ENV to test
    NODE_ENV: 'test',
  },
  
  // Mock utilities
  moduleNameMapper: {
    // Mock any problematic modules here
    '^typeorm$': '<rootDir>/test/mocks/typeorm.mock.js',
  },
  
  // Global variables available in all test files
  globals: {
    'ts-jest': {
      diagnostics: {
        // Ignore certain TypeScript diagnostic codes in tests
        ignoreCodes: [
          2571, // Object is of type 'unknown'
          2339, // Property does not exist on type
          2345, // Argument of type is not assignable to parameter of type
          2322, // Type is not assignable to type
        ],
      },
      isolatedModules: true,
    },
  },
};

module.exports = config; 