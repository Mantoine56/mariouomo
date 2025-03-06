import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../modules/auth/decorators/public.decorator';

/**
 * Health Controller
 * 
 * Provides endpoints for application health monitoring and status checks.
 * These endpoints are public and don't require authentication.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * Basic health check endpoint
   * 
   * Returns a simple status response to verify the API is running
   * This endpoint is public and doesn't require authentication
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Basic health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is operational' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }
}
