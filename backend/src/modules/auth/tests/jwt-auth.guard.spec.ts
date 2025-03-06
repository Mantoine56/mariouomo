import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

/**
 * Unit tests for JWT Authentication Guard
 * Tests the guard's behavior in authenticating requests using JWT tokens
 */
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    // Create a testing module with a mock Reflector
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    // Get the instances from the testing module
    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard', () => {
    // Verify the guard extends AuthGuard
    const isAuthGuard = guard instanceof AuthGuard('jwt');
    expect(isAuthGuard).toBeTruthy();
  });

  it('should allow access to public routes', async () => {
    // Mock the reflector to return true for IS_PUBLIC_KEY
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    
    // Create a mock execution context
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
    
    // Test that the guard allows access
    expect(await guard.canActivate(mockContext)).toBe(true);
    
    // Verify the reflector was called with the correct parameters
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      'isPublic',
      [mockContext.getHandler(), mockContext.getClass()]
    );
  });
});
