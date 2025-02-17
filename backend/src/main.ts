import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingService } from './common/logging/logging.service';

/**
 * Bootstrap the NestJS application with all necessary middleware and configurations.
 */
async function bootstrap() {
  // Create NestJS application instance
  const application = await NestFactory.create(AppModule, {
    logger: false,
  });

  // Setup logging
  const logger = application.get(LoggingService);
  application.useLogger(logger);

  // Setup security middleware
  application.use(helmet());

  // Enable CORS for frontend
  application.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

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
