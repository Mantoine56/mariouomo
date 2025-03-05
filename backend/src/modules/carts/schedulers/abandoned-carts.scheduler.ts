import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShoppingCartRepository } from '../repositories/shopping-cart.repository';

/**
 * Scheduler that handles abandoned shopping carts
 * Marks carts as abandoned if they have been inactive for a specified period
 */
@Injectable()
export class AbandonedCartsScheduler {
  private readonly logger = new Logger(AbandonedCartsScheduler.name);
  
  /**
   * Time in minutes before a cart is considered abandoned
   * @default 30 minutes
   */
  private readonly abandonmentThreshold = 30;
  
  constructor(private readonly cartRepository: ShoppingCartRepository) {}
  
  /**
   * Mark abandoned carts every hour
   * A cart is considered abandoned if it has not been updated for the specified threshold
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markAbandonedCarts(): Promise<void> {
    try {
      this.logger.log('Checking for abandoned carts...');
      
      // Check if the table exists first
      const tableExists = await this.cartRepository.tableExists();
      if (!tableExists) {
        this.logger.warn('Shopping carts table does not exist - skipping abandoned cart check');
        return;
      }
      
      // Mark carts as abandoned
      const count = await this.cartRepository.markAbandonedCarts(this.abandonmentThreshold);
      
      if (count > 0) {
        this.logger.log(`Marked ${count} carts as abandoned`);
      } else {
        this.logger.debug('No abandoned carts found');
      }
    } catch (error) {
      this.logger.error(`Error marking abandoned carts: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Get metrics on abandoned carts
   * @returns Promise<{ count: number }> Count of abandoned carts
   */
  async getAbandonedCartMetrics(): Promise<{ count: number }> {
    try {
      const carts = await this.cartRepository.findAbandonedCarts(this.abandonmentThreshold);
      return { count: carts.length };
    } catch (error) {
      this.logger.error(`Error getting abandoned cart metrics: ${error.message}`, error.stack);
      return { count: 0 };
    }
  }
} 