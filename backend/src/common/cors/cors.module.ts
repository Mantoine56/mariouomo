import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * CORS (Cross-Origin Resource Sharing) module that provides security controls
 * for cross-origin requests. This helps prevent unauthorized websites from
 * accessing our API resources.
 * 
 * Features:
 * - Whitelist allowed origins (domains)
 * - Control allowed HTTP methods
 * - Manage allowed headers
 * - Handle preflight requests
 * - Control credentials (cookies, auth headers)
 */
@Module({
  imports: [ConfigModule],
})
export class CorsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Configure CORS middleware with security-focused settings.
   * @param consumer - NestJS middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    // Get allowed origins from environment
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const allowedOrigins = [
      frontendUrl,
      // Add development URLs if in development mode
      ...(this.configService.get('NODE_ENV') === 'development' 
        ? ['http://localhost:3001'] 
        : []),
    ];

    // Define CORS options
    const corsOptions = {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
      exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ],
      credentials: true,
      maxAge: 3600,
    };

    // Apply CORS middleware to all routes
    consumer
      .apply((req: any, res: any, next: () => void) => {
        const origin = req.headers.origin;

        // Block requests from unauthorized origins
        if (origin && !allowedOrigins.includes(origin)) {
          res.status(403).json({ 
            statusCode: 403,
            message: 'Origin not allowed by CORS policy',
            error: 'Forbidden'
          });
          return;
        }
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          // Set CORS headers for preflight
          if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
          }
          res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
          res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
          res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(','));
          res.header('Access-Control-Allow-Credentials', 'true');
          res.header('Access-Control-Max-Age', corsOptions.maxAge);
          res.sendStatus(204); // No content needed for preflight
          return;
        }

        // Set CORS headers for actual requests
        if (origin) {
          res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(','));
        next();
      })
      .forRoutes('*');
  }
}
