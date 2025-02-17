import { Controller, Get, Post, Body } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Controller for testing Redis cache functionality.
 * Provides endpoints to set and retrieve test values from the cache.
 */
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Store a test value in the Redis cache.
   * @param body - Object containing key and value to store
   * @returns Message indicating success
   */
  @Post('test')
  async setTestValue(@Body() body: { key: string; value: string }) {
    await this.cacheService.set(body.key, body.value);
    return { message: 'Value set successfully' };
  }

  /**
   * Retrieve a test value from the Redis cache.
   * @param body - Object containing key to look up
   * @returns Object containing the retrieved value
   */
  @Get('test')
  async getTestValue(@Body() body: { key: string }) {
    const value = await this.cacheService.get(body.key);
    return { value };
  }
}
