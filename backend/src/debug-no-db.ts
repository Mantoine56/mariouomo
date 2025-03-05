// Load environment variables first
require('dotenv').config();

// Add crypto polyfill for Node.js versions that don't have it globally
global.crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';
import { AnalyticsDevController } from './modules/analytics/controllers/analytics-dev.controller';

/**
 * Simplified module for development that only includes the AnalyticsDevController
 */
@Module({
  controllers: [AnalyticsDevController],
})
class MinimalAppModule {}

/**
 * Simplified bootstrap that only starts a minimal application with the AnalyticsDevController
 */
async function debugNoDB() {
  try {
    console.log('Creating minimal NestJS application (no database)...');
    const app = await NestFactory.create<NestExpressApplication>(MinimalAppModule, {
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
    console.log(`Development analytics endpoints available at http://localhost:${port}/dev/analytics/*`);
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
}

debugNoDB().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 