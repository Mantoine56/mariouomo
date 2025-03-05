/**
 * User role enumeration
 * 
 * Defines the possible roles a user can have in the system.
 * Used for role-based access control throughout the application.
 */
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MERCHANT = 'merchant',
}
