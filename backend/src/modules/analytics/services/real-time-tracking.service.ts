import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Service for tracking real-time analytics
 * Handles user sessions, page views, and current activity
 */
@Injectable()
export class RealTimeTrackingService {
  private activeUsers: Map<string, Date> = new Map();
  private pageCounts: Map<string, number> = new Map();
  private trafficSources: Map<string, Set<string>> = new Map();
  private trafficSourceDistribution: Map<string, number> = new Map();

  constructor(
    @InjectRepository(RealTimeMetrics)
    private realTimeMetricsRepo: Repository<RealTimeMetrics>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
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
    this.activeUsers.set(sessionId, new Date(Date.now()));
    await this.updateRealTimeMetrics();
  }

  /**
   * Tracks page views
   * @param page Page identifier
   * @param sessionId Session identifier
   */
  async trackPageView(page: string, sessionId: string) {
    this.pageCounts.set(page, (this.pageCounts.get(page) || 0) + 1);
    this.activeUsers.set(sessionId, new Date(Date.now()));
    await this.updateRealTimeMetrics();
  }

  /**
   * Track traffic source for a session
   * @param source - Traffic source (e.g., 'google', 'direct')
   * @param sessionId - Unique session identifier
   */
  async trackTrafficSource(source: string, sessionId: string): Promise<void> {
    // Initialize set for source if it doesn't exist
    if (!this.trafficSources.has(source)) {
      this.trafficSources.set(source, new Set<string>());
    }

    // Get the sessions set and add the new session
    const sessions = this.trafficSources.get(source);
    if (sessions) {
      sessions.add(sessionId);
    }

    await this.updateRealTimeMetrics();
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

    await this.dataSource.transaction(async (manager) => {
      // Get current cart metrics
      const cartMetrics = await manager
        .createQueryBuilder()
        .select([
          'COUNT(DISTINCT cart_id) as cart_count',
          'SUM(total) as cart_value',
        ])
        .from('shopping_carts', 'sc')
        .where('updated_at >= :cutoff', {
          cutoff: new Date(Date.now() - 30 * 60 * 1000),
        })
        .getRawOne();

      // Get pending orders
      const orderMetrics = await manager
        .createQueryBuilder()
        .select([
          'COUNT(*) as pending_count',
          'SUM(total) as pending_value',
        ])
        .from('orders', 'o')
        .where('status = :status', { status: 'pending' })
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

      // Create real-time metrics
      const metrics = manager.create(RealTimeMetrics, {
        timestamp: new Date(Date.now()),
        active_users: this.activeUsers.size,
        active_sessions: this.activeUsers.size,
        cart_count: cartMetrics?.cart_count || 0,
        cart_value: cartMetrics?.cart_value || 0,
        pending_orders: orderMetrics?.pending_count || 0,
        pending_revenue: orderMetrics?.pending_value || 0,
        current_popular_products: popularProducts,
        traffic_sources: trafficSourceMetrics,
        page_views: pageViewMetrics,
        traffic_source_distribution: Array.from(
          this.getTrafficSourceDistribution().entries(),
        ).map(([source, count]) => ({
          source,
          count,
        })),
      });

      await manager.save(RealTimeMetrics, metrics);

      // Emit update event
      this.eventEmitter.emit('analytics.realtime.updated', metrics);
    });
  }
}
