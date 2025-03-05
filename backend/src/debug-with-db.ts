/**
 * Debug bootstrap file with database connection that focuses only on API endpoints
 * Run with: NODE_ENV=development pnpm debug:server:with-db
 */

// Load environment variables first with proper priority
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Force disable seed service
process.env.DISABLE_SEED = 'true';

// Add crypto polyfill if needed
global.crypto = require('crypto');

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Module, DynamicModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AnalyticsDevController } from './modules/analytics/controllers/analytics-dev.controller';
import { AnalyticsController } from './modules/analytics/controllers/analytics.controller';
import { AnalyticsModule } from './modules/analytics/analytics.module';

/**
 * Create a module with API controllers only, focused on analytics
 */
@Module({})
export class ApiOnlyModule {
  static register(): DynamicModule {
    console.log('Setting up ApiOnlyModule...');
    
    return {
      module: ApiOnlyModule,
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
        // Import the Analytics module for more complex analytics endpoints
        AnalyticsModule,
      ],
      // Include the dev controller directly
      controllers: [AnalyticsDevController],
    };
  }
}

/**
 * Bootstrap function with database support
 */
async function bootstrap() {
  console.log('Starting API-only bootstrap with database...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
  
  try {
    console.log('Creating Nest application with ApiOnlyModule...');
    
    const app = await NestFactory.create<NestExpressApplication>(
      ApiOnlyModule.register(),
      {
        logger: ['error', 'warn', 'log', 'debug'],
        abortOnError: false,
      }
    );
    
    console.log('NestJS application created successfully');
    
    // Basic CORS setup for frontend requests
    console.log('Setting up CORS...');
    app.enableCors({
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:3002'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });
    
    // Setup basic validation
    console.log('Setting up validation pipe...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
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
    console.log('- GET /analytics/* (all standard analytics endpoints)');
    
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run bootstrap
bootstrap().catch(err => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
}); 