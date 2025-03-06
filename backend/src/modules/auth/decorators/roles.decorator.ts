import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * Key used for role metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator for specifying required roles for a route
 * @param roles Array of roles that can access the decorated route
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
