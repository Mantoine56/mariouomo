// Disable New Relic completely
process.env.NEW_RELIC_ENABLED = 'false';
process.env.NEW_RELIC_NO_CONFIG_FILE = 'true';
process.env.NEW_RELIC_LOG_ENABLED = 'false';

// Load environment variables first with proper priority
// Load .env.local first (for development overrides), then fall back to .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // This will not overwrite existing env vars

// In development mode, disable the seed service by default to prevent startup issues
// This can be overridden by explicitly setting DISABLE_SEED=false in .env
if (process.env.NODE_ENV === 'development' && process.env.DISABLE_SEED === undefined) {
  process.env.DISABLE_SEED = 'true';
  console.log('Development mode detected - Setting DISABLE_SEED=true to improve startup time');
  console.log('To enable seed service, set DISABLE_SEED=false in .env.local');
}

// Only load New Relic if license key is present
if (process.env.NEW_RELIC_LICENSE_KEY && process.env.NEW_RELIC_LICENSE_KEY !== 'your-dev-sentry-dsn') {
  require('newrelic');
}

// Add crypto polyfill for Node.js versions that don't have it globally
global.crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingService } from './common/logging/logging.service';

/**
 * Bootstrap the NestJS application with all necessary middleware and configurations.
 */
async function bootstrap() {
  console.log('Starting bootstrap process...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
  console.log('DISABLE_SEED:', process.env.DISABLE_SEED);
  
  try {
    // Create NestJS application instance with Express platform
    console.log('Creating NestJS application instance...');
    
    // Use more verbose logging during startup to catch issues
    const application = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'], // Enable full logging during startup
      abortOnError: false, // Continue even if there are errors to help with debugging
    });
    
    console.log('NestJS application instance created successfully');

    // Setup logging (make it optional)
    console.log('Setting up logging service...');
    try {
      // Try to get the LoggingService, but don't fail if it's not available
      const logger = application.get(LoggingService, { strict: false });
      if (logger) {
        application.useLogger(logger);
        console.log('Custom logging service setup complete');
      } else {
        console.log('Custom LoggingService not found, using default logger');
        application.useLogger(new Logger());
      }
    } catch (err) {
      console.log('Error setting up custom LoggingService, using default logger:', err.message);
      application.useLogger(new Logger());
    }

    // Enable CORS for the frontend
    console.log('Setting up CORS...');
    application.enableCors({
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://localhost:3002'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      credentials: true,
      maxAge: 3600,
    });
    console.log('CORS setup complete');

    // Setup security middleware
    console.log('Setting up security middleware...');
    application.use(helmet());
    console.log('Security middleware setup complete');

    // Setup validation
    console.log('Setting up validation pipe...');
    application.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    console.log('Validation pipe setup complete');

    // Setup Swagger documentation
    console.log('Setting up Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('Mario Uomo API')
      .setDescription('The Mario Uomo API documentation - Enterprise-grade e-commerce platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT', // This name here is important for matching the @ApiBearerAuth() decorator
      )
      .addTag('Analytics', 'Endpoints for retrieving and managing analytics data')
      .addTag('Dashboard', 'Endpoints for dashboard visualizations and summaries')
      .build();
    
    // Import schemas from analytics documentation
    const document = SwaggerModule.createDocument(application, config, {
      extraModels: [],
    });
    
    // Add custom schemas for analytics
    document.components = document.components || {};
    document.components.schemas = document.components.schemas || {};
    
    // Add our custom schemas
    document.components.schemas['SalesMetricsResponseSchema'] = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        store_id: { type: 'string', format: 'uuid' },
        date: { type: 'string', format: 'date-time' },
        total_revenue: { type: 'number' },
        total_orders: { type: 'integer' },
        total_units_sold: { type: 'integer' },
        average_order_value: { type: 'number' },
        conversion_rate: { type: 'number' },
        views: { type: 'integer' },
      }
    };
    
    document.components.schemas['InventoryMetricsResponseSchema'] = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        store_id: { type: 'string', format: 'uuid' },
        date: { type: 'string', format: 'date-time' },
        total_inventory_value: { type: 'number' },
        total_items_in_stock: { type: 'integer' },
        low_stock_items: { type: 'integer' },
        out_of_stock_items: { type: 'integer' },
        turnover_rate: { type: 'number' },
      }
    };
    
    document.components.schemas['CustomerMetricsResponseSchema'] = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        store_id: { type: 'string', format: 'uuid' },
        date: { type: 'string', format: 'date-time' },
        total_customers: { type: 'integer' },
        new_customers: { type: 'integer' },
        returning_customers: { type: 'integer' },
        average_purchase_frequency: { type: 'number' },
        customer_lifetime_value: { type: 'number' },
        last_purchase_date: { type: 'string', format: 'date-time' },
      }
    };
    
    // Setup Swagger UI
    SwaggerModule.setup('api', application, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
      },
    });
    console.log('Swagger documentation setup complete');

    // Initialize Sentry for error tracking
    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
      console.log('Initializing Sentry...');
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
      });
      console.log('Sentry initialization complete');
    }

    // Start server
    console.log('Starting server...');
    const port = process.env.PORT || 3001; // Default to 3001 to match mock server
    await application.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    
  } catch (error) {
    console.error('Error during bootstrap process:', error);
    // Exit with error code to indicate failure
    process.exit(1);
  }
}

// Process unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap().catch(err => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
