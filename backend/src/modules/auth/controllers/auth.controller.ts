import { Controller, Get, UseGuards, Request, Logger, Post, Body } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Controller
 * 
 * Handles authentication-related endpoints including:
 * - User profile retrieval
 * - Authentication status checking
 * - Protected route testing
 */
@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Get the current authenticated user's profile
   * 
   * @param req - The request object containing the authenticated user
   * @returns The user's profile information
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: ExpressRequest & { user: { id: string } }) {
    this.logger.log(`Profile requested for user: ${req.user?.id}`);
    return this.authService.getCurrentUser(req.user.id);
  }

  /**
   * Test endpoint for admin-only access
   * 
   * @returns A message indicating successful admin access
   */
  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin-only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  getAdminData() {
    return { 
      message: 'Admin access granted',
      timestamp: new Date().toISOString(),
      accessLevel: 'admin'
    };
  }

  /**
   * Public endpoint that doesn't require authentication
   * 
   * @returns A message indicating the authentication status
   */
  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'Authentication status' })
  getAuthStatus() {
    return { 
      status: 'operational',
      timestamp: new Date().toISOString(),
      message: 'Authentication system is running'
    };
  }

  /**
   * Test endpoint for validating a JWT token
   * 
   * @param tokenData - Object containing the token to validate
   * @returns The decoded token payload
   */
  @Post('validate-token')
  @Public()
  @ApiOperation({ summary: 'Validate a JWT token' })
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  validateToken(@Body() tokenData: { token: string }) {
    this.logger.log('Token validation requested');
    return this.authService.validateToken(tokenData.token);
  }
}
