/**
 * Debug bootstrap file that logs each step of the initialization process
 * Run with: NODE_ENV=development ts-node -r tsconfig-paths/register src/debug-bootstrap.ts
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Force disable seed service
process.env.DISABLE_SEED = 'true';

// Add crypto polyfill if needed
global.crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AnalyticsDevController } from './modules/analytics/controllers/analytics-dev.controller';

/**
 * Create a minimal module with just database connection and analytics dev controller
 */
@Module({})
export class MinimalDebugModule {
  static register(): DynamicModule {
    console.log('Setting up MinimalDebugModule...');
    
    return {
      module: MinimalDebugModule,
      imports: [
        // Core configuration
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        // Database connection
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            console.log('Initializing database connection...');
            const config = getDatabaseConfig(configService);
            
            // Log database configuration details safely
            console.log('Database config generated:', {
              type: config.type || 'not set',
              synchronize: config.synchronize || false,
              // Safely access properties that might not exist on the type but do exist at runtime
              url: typeof (config as any).url === 'string' ? 'URL is set (masked)' : 'URL not set',
              ssl: (config as any).ssl ? 'SSL is enabled' : 'SSL is disabled',
              host: (config as any).host || 'not set',
            });
            
            return config;
          },
        }),
      ],
      controllers: [AnalyticsDevController],
    };
  }
}

/**
 * Debug bootstrap function with detailed logging
 */
async function debugBootstrap() {
  console.log('Starting debug bootstrap...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
  
  try {
    console.log('Creating Nest application with MinimalDebugModule...');
    
    const app = await NestFactory.create<NestExpressApplication>(
      MinimalDebugModule.register(),
      {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        abortOnError: false,
      }
    );
    
    console.log('NestJS application created successfully');
    
    // Basic CORS setup
    console.log('Setting up CORS...');
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      credentials: true,
    });
    
    // Start listening
    console.log('Starting server...');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Server listening on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('- GET /dev/analytics/sales');
    console.log('- GET /dev/analytics/customers');
    console.log('- GET /dev/analytics/products/performance');
    console.log('- GET /dev/analytics/categories/performance');
    
  } catch (error) {
    console.error('Bootstrap error:', error);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run bootstrap
debugBootstrap().catch(err => {
  console.error('Fatal error during bootstrap:', err);
}); 