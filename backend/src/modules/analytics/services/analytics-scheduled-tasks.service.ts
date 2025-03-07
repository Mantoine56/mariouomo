import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsMaterializedViewsService } from './analytics-materialized-views.service';

/**
 * Service for handling scheduled analytics tasks
 * Manages periodic execution of analytics maintenance operations
 */
@Injectable()
export class AnalyticsScheduledTasksService {
  private readonly logger = new Logger(AnalyticsScheduledTasksService.name);

  constructor(
    private readonly materializedViewsService: AnalyticsMaterializedViewsService,
  ) {}

  /**
   * Refreshes materialized views hourly
   * Ensures dashboard queries have access to recent data
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshMaterializedViews() {
    this.logger.log('Running scheduled task: Refresh materialized views');
    try {
      await this.materializedViewsService.refreshMaterializedViews();
      this.logger.log('Successfully refreshed materialized views');
    } catch (error) {
      this.logger.error(`Error refreshing materialized views: ${error.message}`, error.stack);
    }
  }

  /**
   * Runs monthly data aggregation on the 1st day of each month
   * Consolidates daily data into monthly summaries for long-term storage
   */
  @Cron('0 0 1 * *') // At 00:00 on day-of-month 1
  async runMonthlyAggregation() {
    this.logger.log('Running scheduled task: Monthly data aggregation');
    try {
      await this.materializedViewsService.triggerDataAggregation();
      this.logger.log('Successfully completed monthly data aggregation');
    } catch (error) {
      this.logger.error(`Error running monthly aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Applies data retention policy weekly
   * Removes old data according to retention rules
   */
  @Cron(CronExpression.EVERY_WEEK)
  async applyDataRetentionPolicy() {
    this.logger.log('Running scheduled task: Apply data retention policy');
    try {
      await this.materializedViewsService.applyDataRetentionPolicy();
      this.logger.log('Successfully applied data retention policy');
    } catch (error) {
      this.logger.error(`Error applying data retention policy: ${error.message}`, error.stack);
    }
  }
}
