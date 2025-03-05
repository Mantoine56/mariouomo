import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * Interceptor that adds HTTP caching headers to responses.
 * Implements:
 * - Cache-Control headers based on environment and route
 * - ETag generation for content-based caching
 * - Support for conditional requests (If-None-Match)
 */
@Injectable()
export class CacheHeadersInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheHeadersInterceptor.name);
  private readonly defaultMaxAge = 3600; // 1 hour
  private readonly defaultIsPrivate = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate ETag for response data
   * @param data - Response data to hash
   * @returns ETag string
   */
  private generateETag(data: any): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Determine cache settings based on request path
   * @param path - Request path
   * @returns Cache settings object
   */
  private getCacheSettings(path: string): { maxAge: number; isPrivate: boolean } {
    try {
      // Get cache configuration or use defaults if not found
      const config = this.configService.get('httpCache') || {
        defaultMaxAge: this.defaultMaxAge,
        defaultIsPrivate: this.defaultIsPrivate,
        routes: {}
      };

      const defaultSettings = {
        maxAge: config.defaultMaxAge || this.defaultMaxAge,
        isPrivate: config.defaultIsPrivate || this.defaultIsPrivate,
      };

      // Extract route type from path (e.g., /api/products -> products)
      const routeMatch = path.match(/^\/api\/([^\/]+)/);
      if (!routeMatch) {
        return defaultSettings;
      }

      const routeType = routeMatch[1];
      const routes = config.routes || {};
      const routeSettings = routes[routeType];

      return routeSettings || defaultSettings;
    } catch (error) {
      this.logger.warn(`Error getting cache settings: ${error.message}`);
      return {
        maxAge: this.defaultMaxAge,
        isPrivate: this.defaultIsPrivate
      };
    }
  }

  /**
   * Intercept the request/response to add caching headers
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      const response = httpContext.getResponse<Response>();
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      // Get cache settings for this route
      const { maxAge, isPrivate } = this.getCacheSettings(request.path);

      return next.handle().pipe(
        map(data => {
          // Skip cache headers for errors or undefined responses
          if (!data || (typeof data === 'object' && data.statusCode >= 400)) {
            response.setHeader('Cache-Control', 'no-store');
            return data;
          }

          // Generate ETag
          const etag = this.generateETag(data);
          response.setHeader('ETag', etag);

          // Check If-None-Match for conditional requests
          const ifNoneMatch = request.headers['if-none-match'];
          if (ifNoneMatch === etag) {
            response.status(304);
            return;
          }

          // Set Cache-Control header
          const cacheControl = [
            isPrivate ? 'private' : 'public',
            `max-age=${maxAge}`,
            'must-revalidate',
          ];

          // Add development-specific directives
          if (!isProduction) {
            cacheControl.push('no-cache');
          }

          response.setHeader('Cache-Control', cacheControl.join(', '));
          
          // Add Vary header for proper caching
          response.setHeader('Vary', 'Accept, Accept-Encoding, Authorization');

          return data;
        }),
      );
    } catch (error) {
      this.logger.error(`Cache interceptor error: ${error.message}`, error.stack);
      return next.handle(); // Continue without caching if there's an error
    }
  }
}
