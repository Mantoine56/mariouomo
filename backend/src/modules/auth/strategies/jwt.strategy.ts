import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy for Passport authentication
 * 
 * This strategy validates JWT tokens and extracts user information
 * for authenticated requests. It's used by the JwtAuthGuard to
 * protect routes that require authentication.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initialize the JWT strategy with configuration options
   * 
   * @param configService - The NestJS config service for accessing environment variables
   */
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validate the JWT payload and return the user information
   * This method is called by Passport after the token is verified
   * 
   * @param payload - The decoded JWT payload
   * @returns The user object to be attached to the request
   */
  async validate(payload: any) {
    // Basic validation to ensure payload has required fields
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user information from the token
    // This will be attached to the request object as req.user
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
