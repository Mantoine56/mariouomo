import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
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
    const config = this.configService.get('httpCache');
    const defaultSettings = {
      maxAge: config.defaultMaxAge,
      isPrivate: config.defaultIsPrivate,
    };

    // Extract route type from path (e.g., /api/products -> products)
    const routeMatch = path.match(/^\/api\/([^\/]+)/);
    if (!routeMatch) {
      return defaultSettings;
    }

    const routeType = routeMatch[1];
    const routeSettings = config.routes[routeType];

    return routeSettings || defaultSettings;
  }

  /**
   * Intercept the request/response to add caching headers
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse<Response>();
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Get cache settings for this route
    const { maxAge, isPrivate } = this.getCacheSettings(request.path);

    return next.handle().pipe(
      map(data => {
        // Skip cache headers for errors or undefined responses
        if (!data || data.statusCode >= 400) {
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
  }
}
