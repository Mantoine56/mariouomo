import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (not requiring authentication)
 * Used to bypass auth guards for specific endpoints
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); 