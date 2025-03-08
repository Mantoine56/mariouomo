import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
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
    @Optional() @Inject('DbUtilsService') private readonly dbUtilsService: DbUtilsService,
    @Optional() @Inject('ShoppingCartRepository') private readonly shoppingCartRepository: ShoppingCartRepository,
  ) {}

  /**
   * Initialize the service
   * In development mode, this starts the sample data generation
   */
  onModuleInit() {
    this.logger.log('RealTimeTrackingService initialized');
    this.activeUsers = new Map<string, Date>();
    
    // Generate initial sample data in development
    if (process.env.NODE_ENV === 'development') {
      this.generateSampleData();
    }
  }

  /**
   * Run every minute in development mode to update sample metrics
   */
  @Cron('0 * * * * *')
  async scheduledMetricsUpdate() {
    if (process.env.NODE_ENV === 'development') {
      try {
        await this.generateSampleData();
        this.logger.debug('Sample metrics updated via scheduled task');
      } catch (error) {
        this.logger.error(`Error in scheduled metrics update: ${error.message}`);
      }
    } else {
      await this.updateRealTimeMetrics();
    }
  }

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
   * Gets current real-time metrics with trend calculations
   * @returns Current metrics with trend data
   */
  async getCurrentMetrics(): Promise<{
    activeUsers: { current: number; trend: number };
    pageViews: { current: number; trend: number };
    trafficSources: Array<{ source: string; count: number; percentage: number }>;
    popularProducts: Array<{ product_id: string; views: number; in_cart: number }>;
    cart: { count: number; value: number };
    pendingOrders: { count: number; value: number };
  }> {
    try {
      this.logger.debug('Fetching current real-time metrics');
      
      // Get the latest metrics entry - using find with limit instead of findOne
      const latestMetricsArr = await this.realTimeMetricsRepo.find({
        order: { timestamp: 'DESC' },
        take: 1
      });
      
      const latestMetrics = latestMetricsArr.length > 0 ? latestMetricsArr[0] : null;
      
      if (!latestMetrics) {
        this.logger.warn('No real-time metrics found in database');
        return {
          activeUsers: { current: 0, trend: 0 },
          pageViews: { current: 0, trend: 0 },
          trafficSources: [],
          popularProducts: [],
          cart: { count: 0, value: 0 },
          pendingOrders: { count: 0, value: 0 },
        };
      }
      
      // Get historical data for trend calculation
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Use TypeORM's query builder for better compatibility
      const historicalData = await this.realTimeMetricsRepo
        .createQueryBuilder('metrics')
        .where('metrics.timestamp >= :oneHourAgo', { oneHourAgo })
        .orderBy('metrics.timestamp', 'ASC')
        .getMany();
      
      // Calculate trends by comparing latest metrics with data from an hour ago
      let activeUsersTrend = 0;
      let pageViewsTrend = 0;
      
      if (historicalData.length > 1) {
        const oldestMetrics = historicalData[0];
        
        // Calculate percentage changes with proper null/undefined handling
        const oldActiveUsers = oldestMetrics.active_users || 0;
        const newActiveUsers = latestMetrics.active_users || 0;
        
        if (oldActiveUsers > 0) {
          activeUsersTrend = ((newActiveUsers - oldActiveUsers) / oldActiveUsers) * 100;
        }
        
        // Calculate page view trends with proper null/undefined handling
        const oldPageViews = oldestMetrics.page_views || [];
        const newPageViews = latestMetrics.page_views || [];
        
        const oldPageViewsTotal = oldPageViews.reduce((sum, item) => sum + (item.views || 0), 0);
        const newPageViewsTotal = newPageViews.reduce((sum, item) => sum + (item.views || 0), 0);
        
        if (oldPageViewsTotal > 0) {
          pageViewsTrend = ((newPageViewsTotal - oldPageViewsTotal) / oldPageViewsTotal) * 100;
        }
      }
      
      // Format traffic sources for frontend with proper null/undefined handling
      const trafficSources = (latestMetrics.traffic_sources || []).map(source => ({
        source: source.source || 'Unknown',
        count: source.active_users || 0,
        percentage: (latestMetrics.active_sessions || 0) > 0 
          ? ((source.active_users || 0) / (latestMetrics.active_sessions || 1)) * 100 
          : 0,
      }));
      
      // Calculate total page views with proper null/undefined handling
      const pageViewsTotal = (latestMetrics.page_views || []).reduce((sum, page) => sum + (page.views || 0), 0);
      
      // Get popular products with proper type handling
      const popularProducts = (latestMetrics.current_popular_products || []).map(product => ({
        product_id: product.product_id || '',
        views: product.views || 0,
        in_cart: product.in_cart || 0
      }));
      
      return {
        activeUsers: {
          current: latestMetrics.active_users || 0,
          trend: Math.round(activeUsersTrend),
        },
        pageViews: {
          current: pageViewsTotal,
          trend: Math.round(pageViewsTrend),
        },
        trafficSources,
        popularProducts,
        cart: {
          count: latestMetrics.cart_count || 0,
          value: latestMetrics.cart_value || 0,
        },
        pendingOrders: {
          count: latestMetrics.pending_orders || 0,
          value: latestMetrics.pending_revenue || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting current metrics: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch real-time metrics: ${error.message}`);
    }
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
   * @throws Error if tracking fails
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
   * Clears inactive sessions that are older than the timeout
   * Exported for testing purposes
   */
  clearInactiveSessions(): void {
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
  }

  /**
   * Updates real-time metrics
   * Called after each tracking event and periodically
   * @throws Error if update fails critically
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  private async updateRealTimeMetrics() {
    try {
      // Use the clearInactiveSessions method
      this.clearInactiveSessions();

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
      
      // Create traffic source metrics with validation
      const trafficSourceMetrics = Array.from(
        this.trafficSources.entries(),
      )
      .filter(([source, sessions]) => source && sessions) // Validate entries
      .map(([source, sessions]) => ({
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
        if (cartMetrics) {
          this.logger.debug(`Active carts: ${cartMetrics.cart_count || 0}, Value: ${cartMetrics.cart_value || 0}`);
        } else {
          this.logger.warn('No cart metrics returned from repository');
        }
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

  /**
   * Generates sample real-time metrics data for development
   * This is useful for testing the dashboard without real user activity
   */
  async generateSampleData(): Promise<void> {
    try {
      this.logger.log('Generating sample real-time metrics data for development');
      
      const timestamp = new Date();
      
      // Generate random metrics values
      const active_users = Math.floor(Math.random() * 100) + 10;
      const active_sessions = Math.floor(Math.random() * 150) + 20;
      const cart_count = Math.floor(Math.random() * 30) + 5;
      const cart_value = parseFloat((Math.random() * 5000 + 1000).toFixed(2));
      const pending_orders = Math.floor(Math.random() * 15) + 2;
      const pending_revenue = parseFloat((Math.random() * 3000 + 500).toFixed(2));
      
      // Generate popular products
      const current_popular_products = Array.from({ length: 5 }, (_, i) => ({
        product_id: `product-${i + 1}`,
        views: Math.floor(Math.random() * 100) + 20,
        in_cart: Math.floor(Math.random() * 20) + 1,
      }));
      
      // Generate traffic sources
      const traffic_sources = [
        {
          source: 'direct',
          active_users: Math.floor(Math.random() * 40) + 10,
          conversion_rate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        },
        {
          source: 'search',
          active_users: Math.floor(Math.random() * 30) + 10,
          conversion_rate: parseFloat((Math.random() * 4 + 2).toFixed(2)),
        },
        {
          source: 'social',
          active_users: Math.floor(Math.random() * 20) + 5,
          conversion_rate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
        },
        {
          source: 'referral',
          active_users: Math.floor(Math.random() * 15) + 3,
          conversion_rate: parseFloat((Math.random() * 6 + 1).toFixed(2)),
        },
      ];
      
      // Generate page views
      const page_views = [
        {
          page: 'home',
          views: Math.floor(Math.random() * 200) + 50,
          average_time: Math.floor(Math.random() * 120) + 30,
        },
        {
          page: 'products',
          views: Math.floor(Math.random() * 150) + 40,
          average_time: Math.floor(Math.random() * 180) + 60,
        },
        {
          page: 'cart',
          views: Math.floor(Math.random() * 80) + 20,
          average_time: Math.floor(Math.random() * 90) + 45,
        },
        {
          page: 'checkout',
          views: Math.floor(Math.random() * 50) + 10,
          average_time: Math.floor(Math.random() * 240) + 120,
        },
        {
          page: 'account',
          views: Math.floor(Math.random() * 40) + 15,
          average_time: Math.floor(Math.random() * 150) + 60,
        },
      ];
      
      // Create and save the metrics entity
      const metrics = this.realTimeMetricsRepo.create({
        timestamp,
        active_users,
        active_sessions,
        cart_count,
        cart_value,
        pending_orders,
        pending_revenue,
        current_popular_products,
        traffic_sources,
        page_views,
      });
      
      await this.realTimeMetricsRepo.save(metrics);
      this.logger.log('Sample real-time metrics data generated successfully');
      
      // Emit event for websocket updates
      try {
        const currentMetrics = await this.getCurrentMetrics();
        this.eventEmitter.emit('realtime.metrics.updated', currentMetrics);
      } catch (metricError) {
        this.logger.warn(`Could not emit metrics update event: ${metricError.message}`);
        // Still provide basic metrics for the websocket
        this.eventEmitter.emit('realtime.metrics.updated', {
          activeUsers: { current: active_users, trend: 0 },
          pageViews: { current: page_views.reduce((sum, page) => sum + page.views, 0), trend: 0 },
          trafficSources: traffic_sources.map(source => ({
            source: source.source,
            count: source.active_users,
            percentage: active_sessions > 0 ? (source.active_users / active_sessions) * 100 : 0,
          })),
          popularProducts: current_popular_products,
          cart: { count: cart_count, value: cart_value },
          pendingOrders: { count: pending_orders, value: pending_revenue },
        });
      }
    } catch (error) {
      this.logger.error(`Error generating sample data: ${error.message}`, error.stack);
    }
  }
}
