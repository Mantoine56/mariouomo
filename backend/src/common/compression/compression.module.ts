import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as compression from 'compression';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Compression module that provides response compression functionality.
 * Uses the compression middleware to compress responses based on content type.
 * 
 * Features:
 * - Compresses responses using gzip, deflate, or br (Brotli) based on Accept-Encoding
 * - Configurable compression level and threshold
 * - Content type filtering
 */
@Module({
  imports: [ConfigModule],
})
export class CompressionModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Configure compression middleware with optimal settings for production.
   * @param consumer - NestJS middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(compression({
        // Only compress responses larger than 1KB
        threshold: 1024,
        // Skip compression for some content types
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          // Compress by default
          return compression.filter(req, res);
        },
        // Set compression level (0-9, higher = better compression but more CPU)
        level: this.configService.get('NODE_ENV') === 'production' ? 6 : 1,
      }))
      .forRoutes('*');
  }
}
