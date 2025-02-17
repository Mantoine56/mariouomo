import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard that extends the NestJS ThrottlerGuard
 * to provide rate limiting functionality across the application.
 * 
 * Can be customized to:
 * - Skip rate limiting for certain routes
 * - Apply different limits based on user roles
 * - Track limits by custom keys (e.g., user ID, IP)
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Get tracking key for rate limiting.
   * Currently uses IP address as the key.
   * @param req - HTTP request object
   * @returns string - Tracking key
   */
  protected getTrackingKey(req: any): string {
    // Get the real IP when behind a proxy
    return (
      req.ips.length ? req.ips[0] : req.ip
    );
  }

  /**
   * Check if route should be excluded from rate limiting
   * @param context - Execution context
   * @returns boolean - True if route should be excluded
   */
  protected async shouldSkip(): Promise<boolean> {
    // Add logic here to skip rate limiting for certain routes
    // Example: return context.getHandler().toString().includes('health');
    return false;
  }
}
