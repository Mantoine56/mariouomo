import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Supabase JWT Strategy for Passport authentication
 * 
 * This strategy validates JWT tokens issued by Supabase Auth
 * and extracts user information for authenticated requests.
 * It's used by the JwtAuthGuard to protect routes that require authentication.
 */
@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Initialize the Supabase JWT strategy with configuration options
   * 
   * @param configService - The NestJS config service for accessing environment variables
   */
  // Create a logger instance for this class
  private readonly logger = new Logger(SupabaseJwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Get JWT secret from environment variables
    // Try different possible environment variable names
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET') || 
                      configService.get<string>('JWT_SECRET') || 
                      configService.get<string>('SUPABASE_JWT_PUBLIC_KEY') ||
                      'development_jwt_secret_for_testing';
    
    // In development mode, we'll use a placeholder secret
    const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
    
    // Must call super() first before accessing 'this'
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: isDevelopment, // Ignore token expiration in development
      secretOrKey: jwtSecret,
    });
    
    // Now we can use 'this' after the super() call
    if (isDevelopment && jwtSecret === 'development_jwt_secret_for_testing') {
      this.logger.warn('Using development JWT secret. This should not be used in production!');
    }
  }

  /**
   * Validate the Supabase JWT payload and return the user information
   * This method is called by Passport after the token is verified
   * 
   * @param payload - The decoded JWT payload from Supabase
   * @returns The user object to be attached to the request
   */
  async validate(payload: any) {
    // In development mode, we'll accept any token
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    
    if (isDevelopment) {
      // For development, if payload is missing, create a mock user
      if (!payload || !payload.sub) {
        this.logger.warn('Using mock user for development');
        return {
          id: 'mock-user-id',
          email: 'dev@example.com',
          role: 'admin', // Give admin access in development
          metadata: {},
        };
      }
    } else {
      // In production, validate the token payload
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
    }

    // Return user information from the token
    // This will be attached to the request object as req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'customer',
      // Include any other relevant user data from the Supabase token
      metadata: payload.user_metadata || {},
    };
  }
}
