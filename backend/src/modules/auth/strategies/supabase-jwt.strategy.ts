import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

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
  private readonly isDevelopment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
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
    this.isDevelopment = isDevelopment;
    
    if (isDevelopment && jwtSecret === 'development_jwt_secret_for_testing') {
      this.logger.warn('Using development JWT secret. This should not be used in production!');
    }
  }

  /**
   * Validate the JWT payload and return the user
   * This method is called by Passport after the token is verified
   * 
   * @param payload - The decoded JWT payload
   * @returns The user object to be attached to the request
   */
  async validate(payload: any) {
    try {
      this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
      
      // Use the AuthService to validate the user
      const user = await this.authService.validateUser(payload);
      
      if (!user) {
        this.logger.error('User validation failed');
        throw new UnauthorizedException('Invalid user');
      }
      
      // Return the user object to be attached to the request
      return user;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      
      // In development mode, we can return a mock user
      if (this.isDevelopment) {
        this.logger.warn('Development mode: Returning mock user');
        return {
          id: payload.sub,
          email: payload.email || 'online@mariouomo.com',
          role: payload.role || 'user'
        };
      }
      
      throw new UnauthorizedException('Invalid token');
    }
  }
}
