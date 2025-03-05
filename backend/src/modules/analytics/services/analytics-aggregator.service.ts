import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { DbUtilsService } from '../../../common/database/db-utils.service';
import { ShoppingCartRepository } from '../../carts/repositories/shopping-cart.repository';

/**
 * Service responsible for aggregating analytics data
 * Runs scheduled jobs to process and aggregate metrics
 */
@Injectable()
export class AnalyticsAggregatorService {
  private readonly logger = new Logger(AnalyticsAggregatorService.name);

  constructor(
    @InjectRepository(SalesMetrics)
    private salesMetricsRepo: Repository<SalesMetrics>,
    @InjectRepository(InventoryMetrics)
    private inventoryMetricsRepo: Repository<InventoryMetrics>,
    @InjectRepository(CustomerMetrics)
    private customerMetricsRepo: Repository<CustomerMetrics>,
    @InjectRepository(RealTimeMetrics)
    private realTimeMetricsRepo: Repository<RealTimeMetrics>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private dbUtilsService: DbUtilsService,
    private readonly shoppingCartRepository: ShoppingCartRepository,
  ) {}

  /**
   * Aggregates daily sales metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyMetrics() {
    try {
      this.logger.log('Aggregating daily metrics...');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      try {
        // Get order metrics for yesterday
        const orders = await this.dataSource.query(
          `SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            SUM(discount_amount) as total_discounts,
            COUNT(DISTINCT user_id) as unique_customers
          FROM orders
          WHERE DATE(created_at) = DATE($1)
          -- Explicitly including soft-deleted records
          -- This query intentionally ignores the deleted_at filter
          GROUP BY DATE(created_at)`,
          [yesterday]
        ).then(results => results[0] || {
          date: yesterday,
          total_orders: '0',
          total_revenue: '0',
          total_discounts: '0',
          unique_customers: '0'
        });

        // Create sales metrics
        await this.dataSource.transaction(async (manager) => {
          try {
            const salesMetrics = manager.create(SalesMetrics, {
              date: yesterday,
              total_orders: parseInt(orders.total_orders, 10),
              total_revenue: parseFloat(orders.total_revenue) || 0,
              total_discounts: parseFloat(orders.total_discounts) || 0,
              unique_customers: parseInt(orders.unique_customers, 10),
              average_order_value:
                parseInt(orders.total_orders, 10) > 0
                  ? parseFloat(orders.total_revenue) / parseInt(orders.total_orders, 10)
                  : 0,
            });

            await manager.save(salesMetrics);
            this.logger.log(`Sales metrics saved for ${yesterday.toISOString().split('T')[0]}`);
          } catch (error) {
            this.logger.error(`Error saving sales metrics: ${error.message}`, error.stack);
          }
        });
      } catch (error) {
        this.logger.error(`Error fetching order data: ${error.message}`, error.stack);
      }

      // Continue with other metrics aggregation...
      // ... (rest of the method)
    } catch (error) {
      this.logger.error(`Error in daily metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Aggregates daily inventory metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyInventoryMetrics() {
    try {
      this.logger.log('Aggregating daily inventory metrics...');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      try {
        await this.dataSource.transaction(async (manager) => {
          try {
            // Create inventory metrics
            const inventoryMetrics = manager.create(InventoryMetrics, {
              date: yesterday,
              // Add inventory metrics data here
              // This is just a placeholder - actual implementation would retrieve real inventory data
              low_stock_count: 0,
              out_of_stock_count: 0,
              restock_alerts: 0,
              inventory_value: 0,
              inventory_turnover: 0,
            });

            await manager.save(inventoryMetrics);
            this.logger.log(`Inventory metrics saved for ${yesterday.toISOString().split('T')[0]}`);
          } catch (error) {
            this.logger.error(`Error saving inventory metrics: ${error.message}`, error.stack);
          }
        });
      } catch (error) {
        this.logger.error(`Error in inventory metrics transaction: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error in daily inventory metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Aggregates daily customer metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyCustomerMetrics() {
    try {
      this.logger.log('Aggregating daily customer metrics...');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      try {
        await this.dataSource.transaction(async (manager) => {
          try {
            // Create customer metrics
            const customerMetrics = manager.create(CustomerMetrics, {
              date: yesterday,
              // Add customer metrics data here
              // This is just a placeholder - actual implementation would retrieve real customer data
              new_customers: 0,
              returning_customers: 0,
              average_session_duration: 0,
              bounce_rate: 0,
              cart_abandonment_rate: 0,
            });

            await manager.save(customerMetrics);
            this.logger.log(`Customer metrics saved for ${yesterday.toISOString().split('T')[0]}`);
          } catch (error) {
            this.logger.error(`Error saving customer metrics: ${error.message}`, error.stack);
          }
        });
      } catch (error) {
        this.logger.error(`Error in customer metrics transaction: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error in daily customer metrics aggregation: ${error.message}`, error.stack);
    }
  }

  /**
   * Aggregate real-time metrics from various sources
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async aggregateRealTimeMetrics(): Promise<void> {
    try {
      this.logger.log('Aggregating real-time metrics...');
      
      try {
        // Get active cart metrics
        let cartMetrics = { cart_count: 0, cart_value: 0 };
        try {
          cartMetrics = await this.shoppingCartRepository.getActiveCartMetrics(30);
        } catch (error) {
          this.logger.warn(`Error fetching cart metrics: ${error.message}`);
        }

        try {
          await this.dataSource.transaction(async (manager) => {
            try {
              // Create real-time metrics
              const realTimeMetrics = manager.create(RealTimeMetrics, {
                timestamp: new Date(),
                active_users: 0, // Placeholder value
                active_sessions: 0, // Placeholder value
                cart_count: cartMetrics.cart_count,
                cart_value: cartMetrics.cart_value,
                pending_orders: 0, // Placeholder value
                pending_revenue: 0, // Placeholder value
                current_popular_products: [],
                traffic_sources: [],
                page_views: [],
              });

              await manager.save(realTimeMetrics);
              this.logger.log('Real-time metrics saved successfully');
            } catch (error) {
              this.logger.error(`Error saving real-time metrics: ${error.message}`, error.stack);
            }
          });
        } catch (error) {
          this.logger.error(`Error in real-time metrics transaction: ${error.message}`, error.stack);
        }
      } catch (error) {
        this.logger.error(`Error fetching data for real-time metrics: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error in real-time metrics aggregation: ${error.message}`, error.stack);
    }
  }
}
