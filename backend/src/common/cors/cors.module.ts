import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * CORS (Cross-Origin Resource Sharing) module that provides security controls
 * for cross-origin requests. This helps prevent unauthorized websites from
 * accessing our API resources.
 * 
 * CORS settings are applied directly in main.ts using the built-in NestJS CORS support
 * rather than using a custom middleware implementation.
 */
@Module({
  imports: [ConfigModule],
})
export class CorsModule {}
