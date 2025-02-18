require('newrelic');
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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
  // Create NestJS application instance with Express platform
  const application = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  // Setup logging
  const logger = application.get(LoggingService);
  application.useLogger(logger);

  // Setup security middleware
  application.use(helmet());

  // Setup validation
  application.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mario Uomo API')
    .setDescription('The Mario Uomo API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(application, config);
  SwaggerModule.setup('api', application, document);

  // Initialize Sentry for error tracking
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
    });
  }

  // Start server
  const port = process.env.PORT || 3000;
  await application.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
