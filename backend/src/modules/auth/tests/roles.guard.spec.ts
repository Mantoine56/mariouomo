import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

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

  it('should allow access to public routes', () => {
    // First call for IS_PUBLIC_KEY returns true
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? true : undefined);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow access when no roles are required', () => {
    // First call for IS_PUBLIC_KEY returns false, second call for ROLES_KEY returns undefined
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? false : undefined)
      .mockImplementationOnce((key) => key === ROLES_KEY ? undefined : undefined);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access when user is missing', () => {
    // Mock reflector to return not public and require admin role
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? false : undefined)
      .mockImplementationOnce((key) => key === ROLES_KEY ? [Role.ADMIN] : undefined);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should allow access when user has required role', () => {
    // Mock reflector to return not public and require admin role
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? false : undefined)
      .mockImplementationOnce((key) => key === ROLES_KEY ? [Role.ADMIN] : undefined);

    // Mock request with admin user
    mockRequest.mockReturnValue({
      user: {
        role: Role.ADMIN
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access when user has insufficient role', () => {
    // Mock reflector to return not public and require admin role
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? false : undefined)
      .mockImplementationOnce((key) => key === ROLES_KEY ? [Role.ADMIN] : undefined);

    // Mock request with regular user
    mockRequest.mockReturnValue({
      user: {
        role: Role.USER
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should handle multiple required roles', () => {
    // Mock reflector to return not public and require either admin or super_admin role
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockImplementationOnce((key) => key === IS_PUBLIC_KEY ? false : undefined)
      .mockImplementationOnce((key) => key === ROLES_KEY ? [Role.ADMIN, Role.SUPER_ADMIN] : undefined);

    // Mock request with admin user
    mockRequest.mockReturnValue({
      user: {
        role: Role.ADMIN
      }
    });

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
