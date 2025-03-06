import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has permission to access the route
   * @param context Execution context containing the request
   * @returns Boolean indicating if access is allowed
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access to public routes
    if (isPublic) {
      return true;
    }

    // Get required roles from the route handler
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the request object which contains the user
    const { user } = context.switchToHttp().getRequest();
    
    // If no user is present, deny access
    if (!user) {
      return false;
    }

    // Check if the user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
