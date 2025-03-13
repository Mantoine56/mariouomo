import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard for JWT authentication
 * Extends the Passport AuthGuard to protect routes with JWT validation
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the route is accessible
   * Checks for the Public decorator or validates the JWT
   */
  canActivate(context: ExecutionContext) {
    // Get route handler and controller class
    const handler = context.getHandler();
    const controller = context.getClass();
    
    this.logger.debug(`Checking JWT auth for ${controller.name}.${handler.name}`);
    
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    // Allow access to public routes
    if (isPublic) {
      this.logger.debug('Route is marked as public, bypassing JWT auth');
      return true;
    }

    // Extract request details for better logging
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;
    
    this.logger.debug(`Authenticating ${method} request to ${url}`);
    
    // For non-public routes, perform JWT validation
    return super.canActivate(context);
  }
  
  /**
   * Handles authentication failures
   * Provides detailed error messages for debugging
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;
    
    // If there's an error or no user, authentication failed
    if (err || !user) {
      const errorMsg = err?.message || info?.message || 'Unauthorized access';
      this.logger.warn(`Authentication failed for ${method} ${url}: ${errorMsg}`);
      
      if (info) {
        this.logger.debug(`Auth failure details: ${JSON.stringify(info)}`);
      }
      
      throw err || new UnauthorizedException(`Authentication required: ${errorMsg}`);
    }
    
    this.logger.debug(`User ${user.id || 'unknown'} authenticated successfully for ${method} ${url}`);
    
    // Authentication successful, return the user
    return user;
  }
}
