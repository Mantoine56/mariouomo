// Load environment variables first with proper priority
// Load .env.local first (for development overrides), then fall back to .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // This will not overwrite existing env vars

// Add crypto polyfill for Node.js versions that don't have it globally
global.crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

/**
 * Simplified bootstrap for debugging
 */
async function debug() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    console.log('Setting up CORS...');
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      credentials: true,
    });

    console.log('Starting server...');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
}

debug().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 