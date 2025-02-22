import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';

/**
 * Service responsible for aggregating analytics data
 * Runs scheduled jobs to process and aggregate metrics
 */
@Injectable()
export class AnalyticsAggregatorService {
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
  ) {}

  /**
   * Aggregates daily sales metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailySalesMetrics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.dataSource.transaction(async (manager) => {
      // Get all orders for yesterday
      const orders = await manager
        .createQueryBuilder()
        .select([
          'DATE(created_at) as date',
          'COUNT(*) as total_orders',
          'SUM(total) as total_revenue',
          'SUM(discount_amount) as total_discounts',
          'COUNT(DISTINCT customer_id) as unique_customers',
        ])
        .from('orders', 'o')
        .where('DATE(created_at) = DATE(:yesterday)', { yesterday })
        .groupBy('DATE(created_at)')
        .getRawOne();

      // Get product performance
      const productPerformance = await manager
        .createQueryBuilder()
        .select([
          'p.id as product_id',
          'SUM(oi.quantity) as units_sold',
          'SUM(oi.total) as revenue',
        ])
        .from('order_items', 'oi')
        .leftJoin('products', 'p', 'p.id = oi.product_id')
        .where('DATE(oi.created_at) = DATE(:yesterday)', { yesterday })
        .groupBy('p.id')
        .orderBy('revenue', 'DESC')
        .limit(10)
        .getRawMany();

      // Get category performance
      const categoryPerformance = await manager
        .createQueryBuilder()
        .select([
          'c.id as category_id',
          'SUM(oi.quantity) as units_sold',
          'SUM(oi.total) as revenue',
        ])
        .from('order_items', 'oi')
        .leftJoin('products', 'p', 'p.id = oi.product_id')
        .leftJoin('categories', 'c', 'c.id = p.category_id')
        .where('DATE(oi.created_at) = DATE(:yesterday)', { yesterday })
        .groupBy('c.id')
        .getRawMany();

      // Create sales metrics
      const salesMetrics = this.salesMetricsRepo.create({
        date: yesterday,
        total_revenue: orders.total_revenue || 0,
        total_orders: orders.total_orders || 0,
        average_order_value:
          orders.total_orders > 0
            ? orders.total_revenue / orders.total_orders
            : 0,
        total_units_sold: productPerformance.reduce(
          (sum, p) => sum + p.units_sold,
          0,
        ),
        discount_amount: orders.total_discounts || 0,
        conversion_rate: 0, // Will be calculated with visitor data
        top_products: productPerformance,
        sales_by_category: categoryPerformance,
      });

      await manager.save(SalesMetrics, salesMetrics);
      this.eventEmitter.emit('analytics.sales.aggregated', salesMetrics);
    });
  }

  /**
   * Aggregates daily inventory metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyInventoryMetrics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.dataSource.transaction(async (manager) => {
      // Get inventory summary
      const inventorySummary = await manager
        .createQueryBuilder()
        .select([
          'COUNT(*) as total_sku_count',
          'COUNT(CASE WHEN quantity <= reorder_point THEN 1 END) as low_stock_items',
          'COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_items',
          'SUM(quantity * cost) as inventory_value',
        ])
        .from('inventory_items', 'i')
        .getRawOne();

      // Get stock by location
      const stockByLocation = await manager
        .createQueryBuilder()
        .select([
          'location',
          'COUNT(*) as total_items',
          'SUM(quantity * cost) as total_value',
        ])
        .from('inventory_items', 'i')
        .groupBy('location')
        .getRawMany();

      // Get category metrics
      const categoryMetrics = await manager
        .createQueryBuilder()
        .select([
          'c.id as category_id',
          'AVG(i.turnover_rate) as turnover_rate',
          'SUM(i.quantity * i.cost) as stock_value',
        ])
        .from('inventory_items', 'i')
        .leftJoin('products', 'p', 'p.id = i.product_id')
        .leftJoin('categories', 'c', 'c.id = p.category_id')
        .groupBy('c.id')
        .getRawMany();

      // Create inventory metrics
      const inventoryMetrics = this.inventoryMetricsRepo.create({
        date: yesterday,
        turnover_rate: 0, // Will be calculated with sales data
        total_sku_count: inventorySummary.total_sku_count,
        low_stock_items: inventorySummary.low_stock_items,
        out_of_stock_items: inventorySummary.out_of_stock_items,
        inventory_value: inventorySummary.inventory_value,
        dead_stock_percentage: 0, // Will be calculated with movement data
        stock_by_location: stockByLocation,
        category_metrics: categoryMetrics,
      });

      await manager.save(InventoryMetrics, inventoryMetrics);
      this.eventEmitter.emit('analytics.inventory.aggregated', inventoryMetrics);
    });
  }

  /**
   * Aggregates daily customer metrics
   * Runs at the end of each day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyCustomerMetrics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.dataSource.transaction(async (manager) => {
      // Get customer summary
      const customerSummary = await manager
        .createQueryBuilder()
        .select([
          'COUNT(CASE WHEN first_order_date = :yesterday THEN 1 END) as new_customers',
          'COUNT(CASE WHEN first_order_date != :yesterday THEN 1 END) as returning_customers',
          'AVG(lifetime_value) as avg_lifetime_value',
        ])
        .from('customers', 'c')
        .where('DATE(last_order_date) = DATE(:yesterday)', { yesterday })
        .getRawOne();

      // Get purchase frequency
      const purchaseFrequency = await manager
        .createQueryBuilder()
        .select([
          'frequency',
          'COUNT(*) as customer_count',
          'SUM(total_spent) as revenue',
        ])
        .from('customer_purchase_frequency', 'cpf')
        .where('DATE(updated_at) = DATE(:yesterday)', { yesterday })
        .groupBy('frequency')
        .getRawMany();

      // Get customer segments
      const customerSegments = await manager
        .createQueryBuilder()
        .select([
          'segment',
          'COUNT(*) as customer_count',
          'SUM(total_spent) as total_revenue',
          'AVG(avg_order_value) as average_order_value',
        ])
        .from('customer_segments', 'cs')
        .where('DATE(updated_at) = DATE(:yesterday)', { yesterday })
        .groupBy('segment')
        .getRawMany();

      // Get geographic distribution
      const geographicDistribution = await manager
        .createQueryBuilder()
        .select([
          'region',
          'COUNT(*) as customer_count',
          'SUM(total_spent) as revenue',
        ])
        .from('customers', 'c')
        .where('DATE(last_order_date) = DATE(:yesterday)', { yesterday })
        .groupBy('region')
        .getRawMany();

      // Create customer metrics
      const customerMetrics = this.customerMetricsRepo.create({
        date: yesterday,
        new_customers: customerSummary.new_customers,
        returning_customers: customerSummary.returning_customers,
        customer_lifetime_value: customerSummary.avg_lifetime_value,
        retention_rate: 0, // Will be calculated with historical data
        churn_rate: 0, // Will be calculated with historical data
        purchase_frequency: purchaseFrequency,
        customer_segments: customerSegments,
        geographic_distribution: geographicDistribution,
      });

      await manager.save(CustomerMetrics, customerMetrics);
      this.eventEmitter.emit('analytics.customer.aggregated', customerMetrics);
    });
  }

  /**
   * Aggregates real-time metrics
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async aggregateRealTimeMetrics() {
    await this.dataSource.transaction(async (manager) => {
      // Get active sessions
      const sessionMetrics = await manager
        .createQueryBuilder()
        .select([
          'COUNT(DISTINCT session_id) as active_sessions',
          'COUNT(DISTINCT user_id) as active_users',
        ])
        .from('user_sessions', 'us')
        .where('last_activity >= :cutoff', {
          cutoff: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        })
        .getRawOne();

      // Get cart metrics
      const cartMetrics = await manager
        .createQueryBuilder()
        .select([
          'COUNT(*) as cart_count',
          'SUM(total) as cart_value',
        ])
        .from('shopping_carts', 'sc')
        .where('updated_at >= :cutoff', {
          cutoff: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        })
        .getRawOne();

      // Get popular products
      const popularProducts = await manager
        .createQueryBuilder()
        .select([
          'p.id as product_id',
          'COUNT(pv.id) as views',
          'COUNT(ci.id) as in_cart',
        ])
        .from('products', 'p')
        .leftJoin('product_views', 'pv', 'pv.product_id = p.id')
        .leftJoin('cart_items', 'ci', 'ci.product_id = p.id')
        .where('pv.viewed_at >= :cutoff', {
          cutoff: new Date(Date.now() - 30 * 60 * 1000),
        })
        .groupBy('p.id')
        .orderBy('views', 'DESC')
        .limit(10)
        .getRawMany();

      // Create real-time metrics
      const realTimeMetrics = this.realTimeMetricsRepo.create({
        timestamp: new Date(),
        active_users: sessionMetrics.active_users,
        active_sessions: sessionMetrics.active_sessions,
        cart_count: cartMetrics.cart_count,
        cart_value: cartMetrics.cart_value,
        current_popular_products: popularProducts,
        traffic_sources: [], // Will be implemented with traffic tracking
        page_views: [], // Will be implemented with page tracking
      });

      await manager.save(RealTimeMetrics, realTimeMetrics);
      this.eventEmitter.emit('analytics.realtime.updated', realTimeMetrics);
    });
  }
}
