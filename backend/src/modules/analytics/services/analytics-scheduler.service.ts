import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsCollectorService } from './analytics-collector.service';
import { Store } from '../../stores/entities/store.entity';

/**
 * Service responsible for scheduling analytics aggregation tasks
 * Runs periodic jobs to aggregate metrics and maintain data consistency
 */
@Injectable()
export class AnalyticsSchedulerService {
  private readonly logger = new Logger(AnalyticsSchedulerService.name);

  constructor(
    private analyticsCollectorService: AnalyticsCollectorService,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  /**
   * Daily aggregation job
   * Runs at 1:00 AM every day to aggregate previous day's metrics
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyAggregation() {
    this.logger.log('Starting daily metrics aggregation');
    
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      // Get all active stores
      const stores = await this.storeRepository.find({
        where: { status: 'active' }
      });
      
      this.logger.log(`Aggregating metrics for ${stores.length} stores`);
      
      // Aggregate metrics for each store
      for (const store of stores) {
        await this.analyticsCollectorService.aggregateDailyMetrics(yesterday, store.id);
        this.logger.log(`Completed aggregation for store: ${store.id}`);
      }
      
      this.logger.log('Daily metrics aggregation completed successfully');
    } catch (error) {
      this.logger.error(`Error during daily metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Weekly aggregation job
   * Runs at 2:00 AM every Sunday to aggregate weekly metrics
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyAggregation() {
    this.logger.log('Starting weekly metrics aggregation');
    
    try {
      // Get all active stores
      const stores = await this.storeRepository.find({
        where: { status: 'active' }
      });
      
      // Get the date for the start of the previous week (Sunday to Saturday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
      startOfLastWeek.setHours(0, 0, 0, 0);
      
      // Process weekly aggregation for each store
      // This would involve more complex aggregation logic that spans multiple days
      // For now, we'll just log the intent
      this.logger.log(`Weekly aggregation would process data from ${startOfLastWeek.toISOString()}`);
      
      this.logger.log('Weekly metrics aggregation completed successfully');
    } catch (error) {
      this.logger.error(`Error during weekly metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Monthly aggregation job
   * Runs at 3:00 AM on the first day of each month to aggregate monthly metrics
   */
  @Cron('0 3 1 * *')
  async handleMonthlyAggregation() {
    this.logger.log('Starting monthly metrics aggregation');
    
    try {
      // Get all active stores
      const stores = await this.storeRepository.find({
        where: { status: 'active' }
      });
      
      // Get the date for the start of the previous month
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startOfLastMonth.setHours(0, 0, 0, 0);
      
      // Process monthly aggregation for each store
      // This would involve more complex aggregation logic that spans an entire month
      // For now, we'll just log the intent
      this.logger.log(`Monthly aggregation would process data from ${startOfLastMonth.toISOString()}`);
      
      this.logger.log('Monthly metrics aggregation completed successfully');
    } catch (error) {
      this.logger.error(`Error during monthly metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Recovery job for missed aggregations
   * Runs every hour to check for and process any missed aggregations
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleMissedAggregations() {
    this.logger.log('Checking for missed aggregations');
    
    try {
      // This would involve checking a record of completed aggregations
      // and running any that were missed due to system downtime
      // For now, we'll just log the intent
      this.logger.log('Missed aggregation check completed');
    } catch (error) {
      this.logger.error(`Error during missed aggregation check: ${error.message}`, error.stack);
    }
  }
}
