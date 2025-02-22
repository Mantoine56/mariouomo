import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Unit tests for Role-Based Access Control Guard
 * Tests authorization based on user roles
 */
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);

    // Create mock request function
    mockRequest = jest.fn().mockReturnValue({
      user: null
    });

    // Create mock execution context
    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: mockRequest
      })
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    // Mock reflector to return no roles
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access when user has no roles', () => {
    // Mock reflector to require admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should allow access when user has required role', () => {
    // Mock reflector to require admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    // Mock request with admin user
    mockRequest.mockReturnValue({
      user: {
        roles: [Role.ADMIN]
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow access when user has super_admin role', () => {
    // Mock reflector to require admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.SUPER_ADMIN]);

    // Mock request with super_admin user
    mockRequest.mockReturnValue({
      user: {
        roles: [Role.SUPER_ADMIN]
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access when user has insufficient role', () => {
    // Mock reflector to require admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    // Mock request with regular user
    mockRequest.mockReturnValue({
      user: {
        roles: [Role.USER]
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should handle multiple required roles', () => {
    // Mock reflector to require either admin or super_admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Role.ADMIN,
      Role.SUPER_ADMIN
    ]);

    // Mock request with admin user
    mockRequest.mockReturnValue({
      user: {
        roles: [Role.ADMIN]
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should handle user with multiple roles', () => {
    // Mock reflector to require admin role
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    // Mock request with user having multiple roles
    mockRequest.mockReturnValue({
      user: {
        roles: [Role.USER, Role.ADMIN]
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
