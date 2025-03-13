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
                      configService.get<string>('SUPABASE_JWT_PUBLIC_KEY');
    
    if (!jwtSecret) {
      throw new Error('JWT secret not found in environment variables. Check SUPABASE_JWT_SECRET, JWT_SECRET, or SUPABASE_JWT_PUBLIC_KEY.');
    }
    
    // In development mode, we'll use a placeholder secret
    const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
    
    // Must call super() first before accessing 'this'
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Don't ignore token expiration even in development
      secretOrKey: jwtSecret,
      passReqToCallback: true, // Pass request to callback for logging
    });
    
    // Now we can use 'this' after the super() call
    this.isDevelopment = isDevelopment;
    
    this.logger.log(`JWT strategy initialized with proper JWT secret (length: ${jwtSecret.length})`);
  }

  /**
   * Validate the JWT payload and return the user
   * This method is called by Passport after the token is verified
   * 
   * @param request - The HTTP request
   * @param payload - The decoded JWT payload
   * @returns The user object to be attached to the request
   */
  async validate(request: any, payload: any) {
    try {
      // Extract request details for better debugging
      const { url, method, headers } = request;
      const authHeader = headers.authorization || 'No Authorization header';
      
      this.logger.debug(`Validating JWT for ${method} ${url}`);
      this.logger.debug(`Auth header: ${authHeader.substring(0, 15)}...`);
      this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);
      
      // Extract user ID from Supabase payload
      const userId = payload.sub;
      
      if (!userId) {
        this.logger.error('Invalid token payload - no user ID (sub) found');
        throw new UnauthorizedException('Invalid token payload');
      }
      
      // Use the AuthService to validate the user
      const user = await this.authService.validateUser(payload);
      
      if (!user) {
        this.logger.error(`User validation failed for user ID: ${userId}`);
        throw new UnauthorizedException('Invalid user');
      }
      
      this.logger.debug(`Successfully validated user ${userId} with role ${user.role}`);
      
      // Return the user object to be attached to the request
      return user;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}
