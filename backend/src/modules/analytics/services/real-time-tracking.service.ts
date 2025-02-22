import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

  constructor(
    @InjectRepository(RealTimeMetrics)
    private realTimeMetricsRepo: Repository<RealTimeMetrics>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Tracks user activity
   * @param userId User identifier
   * @param sessionId Session identifier
   */
  async trackUserActivity(userId: string, sessionId: string) {
    this.activeUsers.set(sessionId, new Date());
    await this.updateRealTimeMetrics();
  }

  /**
   * Tracks page views
   * @param page Page identifier
   * @param sessionId Session identifier
   */
  async trackPageView(page: string, sessionId: string) {
    this.pageCounts.set(page, (this.pageCounts.get(page) || 0) + 1);
    this.activeUsers.set(sessionId, new Date());
    await this.updateRealTimeMetrics();
  }

  /**
   * Tracks traffic sources
   * @param source Traffic source
   * @param sessionId Session identifier
   */
  async trackTrafficSource(source: string, sessionId: string) {
    if (!this.trafficSources.has(source)) {
      this.trafficSources.set(source, new Set());
    }
    this.trafficSources.get(source).add(sessionId);
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
    for (const [sessionId, lastActive] of this.activeUsers.entries()) {
      if (lastActive < staleTime) {
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
        timestamp: new Date(),
        active_users: this.activeUsers.size,
        active_sessions: this.activeUsers.size,
        cart_count: cartMetrics.cart_count || 0,
        cart_value: cartMetrics.cart_value || 0,
        pending_orders: orderMetrics.pending_count || 0,
        pending_revenue: orderMetrics.pending_value || 0,
        current_popular_products: popularProducts,
        traffic_sources: trafficSourceMetrics,
        page_views: pageViewMetrics,
      });

      await manager.save(RealTimeMetrics, metrics);

      // Emit update event
      this.eventEmitter.emit('analytics.realtime.updated', metrics);
    });
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
   * Gets current traffic source distribution
   */
  getTrafficSourceDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    for (const [source, sessions] of this.trafficSources.entries()) {
      distribution.set(source, sessions.size);
    }
    return distribution;
  }
}
