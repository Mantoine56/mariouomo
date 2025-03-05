import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbUtilsService } from '../../../common/database/db-utils.service';
import { ShoppingCartRepository } from '../../carts/repositories/shopping-cart.repository';

/**
 * Service for tracking real-time analytics
 * Handles user sessions, page views, and current activity
 */
@Injectable()
export class RealTimeTrackingService {
  private readonly logger = new Logger(RealTimeTrackingService.name);
  private activeUsers: Map<string, Date> = new Map();
  private pageCounts: Map<string, number> = new Map();
  private trafficSources: Map<string, Set<string>> = new Map();
  private trafficSourceDistribution: Map<string, number> = new Map();

  constructor(
    @InjectRepository(RealTimeMetrics)
    private realTimeMetricsRepo: Repository<RealTimeMetrics>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private readonly dbUtilsService: DbUtilsService,
    private readonly shoppingCartRepository: ShoppingCartRepository,
  ) {}

  /**
   * Gets current active user count
   */
  getActiveUserCount(): number {
    return this.activeUsers.size;
  }

  /**
   * Gets current page view counts
   */
  getPageViewCounts(): Map<string, number> {
    return new Map(this.pageCounts);
  }

  /**
   * Gets current metrics for the real-time dashboard
   */
  async getCurrentMetrics() {
    // Get latest metrics
    const current = await this.realTimeMetricsRepo.findOne({
      order: {
        timestamp: 'DESC',
      },
    });

    // Get historical data for trends (last hour)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const trends = await this.realTimeMetricsRepo.find({
      where: {
        timestamp: MoreThanOrEqual(hourAgo),
      },
      order: {
        timestamp: 'ASC',
      },
    });

    // Calculate key trends
    const activeUserTrend = trends.map((t) => ({
      timestamp: t.timestamp,
      users: t.active_users,
    }));

    const pageViewTrend = trends.map((t) => ({
      timestamp: t.timestamp,
      views: t.page_views,
    }));

    const trafficSourceTrend = trends.map((t) => ({
      timestamp: t.timestamp,
      sources: t.traffic_sources,
    }));

    return {
      activeUsers: current?.active_users || 0,
      pageViews: current?.page_views || [],
      trafficSources: current?.traffic_sources || [],
      trends: {
        activeUsers: activeUserTrend,
        pageViews: pageViewTrend,
        trafficSources: trafficSourceTrend,
      },
    };
  }

  /**
   * Tracks user activity
   * @param userId User identifier
   * @param sessionId Session identifier
   */
  async trackUserActivity(userId: string, sessionId: string) {
    try {
      this.activeUsers.set(sessionId, new Date());
      this.logger.debug(`User activity tracked: ${userId}, Session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error tracking user activity: ${error.message}`, error.stack);
    }
  }

  /**
   * Tracks page views
   * @param page Page identifier
   * @param sessionId Session identifier
   */
  async trackPageView(page: string, sessionId: string) {
    try {
      // Update active user timestamp
      this.activeUsers.set(sessionId, new Date());
      
      // Increment page view count
      const currentCount = this.pageCounts.get(page) || 0;
      this.pageCounts.set(page, currentCount + 1);
      
      this.logger.debug(`Page view tracked: ${page}, Session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error tracking page view: ${error.message}`, error.stack);
    }
  }

  /**
   * Track traffic source for a session
   * @param source - Traffic source (e.g., 'google', 'direct')
   * @param sessionId - Unique session identifier
   */
  async trackTrafficSource(source: string, sessionId: string): Promise<void> {
    try {
      // Update active user timestamp
      this.activeUsers.set(sessionId, new Date());
      
      // Add session to traffic source
      if (!this.trafficSources.has(source)) {
        this.trafficSources.set(source, new Set());
      }
      
      // Get the sessions set and add the new session
      const sessions = this.trafficSources.get(source);
      if (sessions) {
        sessions.add(sessionId);
      }
      
      // Update the distribution
      this.updateTrafficSourceDistribution();
      
      this.logger.debug(`Traffic source tracked: ${source}, Session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error tracking traffic source: ${error.message}`, error.stack);
    }
  }

  /**
   * Gets traffic source distribution
   * Returns a map of traffic sources to their unique session counts
   */
  getTrafficSourceDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    for (const [source, sessions] of this.trafficSources.entries()) {
      distribution.set(source, sessions.size);
    }
    return distribution;
  }

  /**
   * Removes a user from tracking
   * @param sessionId Session identifier
   */
  async removeUser(sessionId: string) {
    this.activeUsers.delete(sessionId);
    // Remove from traffic sources
    for (const [source, sessions] of this.trafficSources.entries()) {
      sessions.delete(sessionId);
      if (sessions.size === 0) {
        this.trafficSources.delete(source);
      }
    }
    await this.updateRealTimeMetrics();
  }

  /**
   * Updates real-time metrics
   * Called after each tracking event and periodically
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  private async updateRealTimeMetrics() {
    try {
      // Clean up stale sessions (inactive for more than 15 minutes)
      const staleTime = new Date(Date.now() - 15 * 60 * 1000);
      const staleSessions = new Set<string>();

      for (const [sessionId, lastActive] of this.activeUsers.entries()) {
        if (lastActive < staleTime) {
          staleSessions.add(sessionId);
        }
      }

      // Remove stale sessions
      for (const sessionId of staleSessions) {
        this.activeUsers.delete(sessionId);
        // Remove from traffic sources
        for (const [source, sessions] of this.trafficSources.entries()) {
          sessions.delete(sessionId);
          if (sessions.size === 0) {
            this.trafficSources.delete(source);
          }
        }
      }

      // Gather all the metrics data before entering the transaction
      let cartMetrics = { cart_count: 0, cart_value: 0 };
      let orderMetrics = { pending_count: '0', pending_value: null };
      let popularProducts = [];
      
      // Get cart metrics
      try {
        cartMetrics = await this.shoppingCartRepository.getActiveCartMetrics(30);
      } catch (cartError) {
        this.logger.warn(`Unable to fetch cart metrics: ${cartError.message}`);
      }
      
      // Get pending orders
      try {
        orderMetrics = await this.dataSource.query(
          `SELECT COUNT(*) as pending_count, SUM(total_amount) as pending_value 
             FROM orders 
             WHERE status = $1`,
          ['pending']
        ).then(results => results[0]);
      } catch (orderError) {
        this.logger.warn(`Unable to fetch order metrics: ${orderError.message}`);
      }
      
      // Get popular products
      try {
        // Check if the necessary tables exist
        const productsExist = await this.dbUtilsService.tableExists('products');
        const productViewsExist = await this.dbUtilsService.tableExists('product_views');
        
        if (productsExist && productViewsExist) {
          // First query - just get basic product views without cart data
          popularProducts = await this.dataSource
            .createQueryBuilder()
            .select([
              'p.id as product_id',
              'COUNT(pv.id) as views',
              '0 as in_cart', // Default to 0 for in_cart count
            ])
            .from('products', 'p')
            .leftJoin('product_views', 'pv', 'pv.product_id = p.id')
            .where('pv.viewed_at >= :cutoff', {
              cutoff: new Date(Date.now() - 30 * 60 * 1000),
            })
            .groupBy('p.id')
            .orderBy('views', 'DESC')
            .limit(10)
            .getRawMany();
          
          // If we have cart_items table, try to enhance with cart data
          const cartItemsExist = await this.dbUtilsService.tableExists('cart_items');
          
          if (cartItemsExist && popularProducts.length > 0) {
            try {
              // Get product IDs from results
              const productIds = popularProducts.map(p => p.product_id);
              
              // Get product variants that match our product IDs
              const variants = await this.dataSource
                .createQueryBuilder()
                .select('id')
                .from('product_variants', 'pv')
                .where('pv.product_id IN (:...productIds)', { productIds })
                .getRawMany();
              
              const variantIds = variants.map(v => v.id);
              
              if (variantIds.length > 0) {
                // Query cart data using variant_id which links to product_variants
                const cartCounts = await this.dataSource
                  .createQueryBuilder()
                  .select([
                    'pv.product_id',
                    'COUNT(*) as count',
                  ])
                  .from('cart_items', 'ci')
                  .innerJoin('product_variants', 'pv', 'ci.variant_id = pv.id')
                  .where('ci.variant_id IN (:...variantIds)', { variantIds })
                  .groupBy('pv.product_id')
                  .getRawMany();
                
                // Create a map for quick lookup
                const cartCountMap = cartCounts.reduce((map, item) => {
                  map[item.product_id] = parseInt(item.count, 10);
                  return map;
                }, {});
                
                // Enhance results with cart data
                popularProducts = popularProducts.map(product => ({
                  ...product,
                  in_cart: cartCountMap[product.product_id] || 0
                }));
              }
            } catch (error) {
              this.logger.warn(`Error fetching cart data: ${error.message}`);
              // Continue with original results
            }
          }
        }
      } catch (error) {
        this.logger.warn(`Unable to fetch popular products: ${error.message}`);
      }
      
      // Create traffic source metrics
      const trafficSourceMetrics = Array.from(
        this.trafficSources.entries(),
      ).map(([source, sessions]) => ({
        source,
        active_users: sessions.size,
        conversion_rate: 0, // Will be calculated with order data
      }));

      // Create page view metrics
      const pageViewMetrics = Array.from(this.pageCounts.entries()).map(
        ([page, views]) => ({
          page,
          views,
          average_time: 0, // Will be calculated with session data
        }),
      );
      
      // Now do the final transaction to save the metrics
      try {
        // Create real-time metrics
        const metrics = this.realTimeMetricsRepo.create({
          timestamp: new Date(Date.now()),
          active_users: this.activeUsers.size,
          active_sessions: this.activeUsers.size,
          cart_count: cartMetrics?.cart_count || 0,
          cart_value: cartMetrics?.cart_value || 0,
          pending_orders: parseInt(orderMetrics?.pending_count || '0', 10),
          pending_revenue: orderMetrics?.pending_value ? parseFloat(orderMetrics.pending_value) : 0,
          current_popular_products: popularProducts,
          traffic_sources: trafficSourceMetrics,
          page_views: pageViewMetrics,
        });

        // Save metrics directly without using transaction
        await this.realTimeMetricsRepo.save(metrics);
        
        // Emit metrics updated event
        this.eventEmitter.emit('analytics.realtime.updated', metrics);
      } catch (error) {
        this.logger.error(`Error saving real-time metrics: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error updating real-time metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Track active shopping carts
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async trackActiveCarts(): Promise<void> {
    try {
      // Get active cart metrics from the repository with error handling
      try {
        const cartMetrics = await this.shoppingCartRepository.getActiveCartMetrics(30);
        this.logger.debug(`Active carts: ${cartMetrics.cart_count}, Value: ${cartMetrics.cart_value}`);
      } catch (error) {
        this.logger.error(`Error tracking active carts: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error in trackActiveCarts: ${error.message}`, error.stack);
    }
  }

  private updateTrafficSourceDistribution(): void {
    try {
      // Clear previous distribution
      this.trafficSourceDistribution.clear();
      
      // Calculate total users
      const totalUsers = this.activeUsers.size;
      
      if (totalUsers === 0) {
        return;
      }
      
      // Calculate percentage for each source
      for (const [source, sessions] of this.trafficSources.entries()) {
        const percentage = (sessions.size / totalUsers) * 100;
        this.trafficSourceDistribution.set(source, percentage);
      }
    } catch (error) {
      this.logger.error(`Error updating traffic source distribution: ${error.message}`, error.stack);
    }
  }

  /**
   * Safely executes a query against tables that might not exist yet
   * @param requiredTables - Array of table names that must exist for the query to execute
   * @param queryFn - Function to execute if tables exist
   * @param defaultValue - Default value to return if tables don't exist
   * @returns The query result or the default value
   */
  private async safeQueryWithTableCheck<T>(
    requiredTables: string[],
    queryFn: () => Promise<T>,
    defaultValue: T
  ): Promise<T> {
    try {
      // Check if all required tables exist
      const tableExistsPromises = requiredTables.map(table => 
        this.dbUtilsService.tableExists(table)
      );
      
      const tableExistsResults = await Promise.all(tableExistsPromises);
      const allTablesExist = tableExistsResults.every(exists => exists);
      
      if (allTablesExist) {
        // All tables exist, execute the query
        return await queryFn();
      } else {
        // Log which tables are missing
        const missingTables = requiredTables.filter((_, index) => !tableExistsResults[index]);
        this.logger.warn(`Skipping query - required tables do not exist: ${missingTables.join(', ')}`);
        return defaultValue;
      }
    } catch (error) {
      this.logger.warn(`Error in safeQueryWithTableCheck: ${error.message}`);
      return defaultValue;
    }
  }
}
