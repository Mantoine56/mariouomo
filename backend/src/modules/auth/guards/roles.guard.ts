import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard for role-based access control
 * Validates if the user has the required roles to access a resource
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has permission to access the route
   * @param context Execution context containing the request
   * @returns Boolean indicating if access is allowed
   */
  canActivate(context: ExecutionContext): boolean {
    // Get route handler and controller class
    const handler = context.getHandler();
    const controller = context.getClass();
    
    this.logger.debug(`Checking roles for ${controller.name}.${handler.name}`);
    
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    // Allow access to public routes
    if (isPublic) {
      this.logger.debug('Route is marked as public, allowing access');
      return true;
    }

    // Get required roles from the route handler
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      handler,
      controller,
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      this.logger.debug('No roles required for this route, allowing access');
      return true;
    }

    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}`);

    // Get the request object which contains the user
    const { user } = context.switchToHttp().getRequest();
    
    // If no user is present, deny access
    if (!user) {
      this.logger.warn('No user object in request, denying access');
      return false;
    }

    this.logger.debug(`User role: ${user.role}`);
    
    // Check if the user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      this.logger.warn(`User with role ${user.role} does not have required roles: ${requiredRoles.join(', ')}`);
    } else {
      this.logger.debug(`Access granted to user with role ${user.role}`);
    }
    
    return hasRole;
  }
}
