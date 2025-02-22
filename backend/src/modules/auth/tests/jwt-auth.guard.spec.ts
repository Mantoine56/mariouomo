import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

/**
 * Unit tests for JWT Authentication Guard
 * Tests the guard's behavior in authenticating requests using JWT tokens
 */
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard', () => {
    // Verify the guard extends AuthGuard
    const isAuthGuard = guard instanceof AuthGuard('jwt');
    expect(isAuthGuard).toBeTruthy();
  });
});
