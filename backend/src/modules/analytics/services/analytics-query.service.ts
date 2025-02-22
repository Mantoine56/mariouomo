/**
 * Service for handling analytics-related database queries
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';

interface CustomerSegment {
  segment: string;
  customer_count: number;
  total_revenue: number;
}

interface SegmentMetrics {
  customers: number;
  revenue: number;
  avg_order_value: number;
}

interface SegmentMap {
  [key: string]: SegmentMetrics;
}

interface TrafficSource {
  source: string;
  visits: number;
  conversion_rate: number;
}

/**
 * Raw sales metrics from database query
 */
interface RawSalesMetrics {
  revenue: number;
  orders: number;
  avg_order_value: number;
  date: Date;
}

/**
 * Raw inventory metrics from database query
 */
interface RawInventoryMetrics {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  turnover_rate: number;
  date: Date;
}

/**
 * Raw customer metrics from database query
 */
interface RawCustomerMetrics {
  retention_rate: number;
  new_customers: number;
  repeat_customers: number;
  date: Date;
}

/**
 * Raw product metrics from database query
 */
interface RawProductMetrics {
  sales: number;
  revenue: number;
  orders: number;
  views: number;
  conversion_rate: number;
  date: Date;
}

/**
 * Raw category metrics from database query
 */
interface RawCategoryMetrics {
  sales: number;
  revenue: number;
  orders: number;
  products: number;
  date: Date;
}

/**
 * Raw traffic source metrics from database query
 */
interface RawTrafficSource {
  name: string;
  visits: number;
  conversion_rate: number;
}

/**
 * Service for querying analytics data
 * Provides methods for dashboard data retrieval
 */
@Injectable()
export class AnalyticsQueryService {
  constructor(
    @InjectRepository(SalesMetrics)
    private salesMetricsRepo: Repository<SalesMetrics>,
    @InjectRepository(InventoryMetrics)
    private inventoryMetricsRepo: Repository<InventoryMetrics>,
    @InjectRepository(CustomerMetrics)
    private customerMetricsRepo: Repository<CustomerMetrics>,
    @InjectRepository(RealTimeMetrics)
    private realTimeMetricsRepo: Repository<RealTimeMetrics>,
  ) {}

  /**
   * Gets sales analytics overview for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getSalesOverview(startDate: Date, endDate: Date) {
    const metrics = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select([
        'SUM(sm.total_revenue) as revenue',
        'SUM(sm.total_orders) as orders',
        'AVG(sm.average_order_value) as avg_order_value',
        'DATE(sm.date) as date',
      ])
      .where('sm.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(sm.date)')
      .getRawMany<RawSalesMetrics>();

    const latestMetrics = metrics[metrics.length - 1];

    return {
      revenue: latestMetrics?.revenue ?? 0,
      orders: latestMetrics?.orders ?? 0,
      averageOrderValue: latestMetrics?.avg_order_value ?? 0,
      trend: metrics.map((m) => ({
        date: m.date,
        revenue: m.revenue,
        orders: m.orders,
      })),
    };
  }

  /**
   * Gets inventory analytics overview for a specific date
   * @param date - Date for inventory analysis
   */
  async getInventoryOverview(date: Date) {
    const metrics = await this.inventoryMetricsRepo
      .createQueryBuilder('im')
      .select([
        'COUNT(*) as total_items',
        'SUM(CASE WHEN im.low_stock_items > 0 THEN 1 ELSE 0 END) as low_stock_items',
        'SUM(CASE WHEN im.out_of_stock_items > 0 THEN 1 ELSE 0 END) as out_of_stock_items',
        'AVG(im.turnover_rate) as turnover_rate',
        'DATE(im.date) as date',
      ])
      .where('im.date <= :date', { date })
      .getRawOne<RawInventoryMetrics>();

    return {
      current: {
        totalItems: metrics?.total_items ?? 0,
        lowStockItems: metrics?.low_stock_items ?? 0,
        outOfStockItems: metrics?.out_of_stock_items ?? 0,
        turnoverRate: metrics?.turnover_rate ?? 0,
      },
      turnoverTrend: [
        {
          date: metrics?.date ?? date,
          turnoverRate: metrics?.turnover_rate ?? 0,
        },
      ],
    };
  }

  /**
   * Gets customer insights for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getCustomerInsights(startDate: Date, endDate: Date) {
    const metrics = await this.customerMetricsRepo
      .createQueryBuilder('customer')
      .select([
        'COUNT(DISTINCT CASE WHEN customer.lastPurchaseDate BETWEEN :startDate AND :endDate THEN customer.id END) as repeat_customers',
        'COUNT(DISTINCT CASE WHEN customer.createdAt BETWEEN :startDate AND :endDate THEN customer.id END) as new_customers',
        'AVG(CASE WHEN customer.lastPurchaseDate >= :startDate THEN 1 ELSE 0 END) * 100 as retention_rate',
        'DATE(customer.createdAt) as date',
      ])
      .where('customer.createdAt <= :endDate', { startDate, endDate })
      .groupBy('DATE(customer.createdAt)')
      .getRawMany<RawCustomerMetrics>();

    const latestMetrics = metrics[metrics.length - 1];
    const retention = latestMetrics?.retention_rate ?? 0;

    return {
      retention,
      churn: 100 - retention,
      newCustomers: latestMetrics?.new_customers ?? 0,
      repeatCustomers: latestMetrics?.repeat_customers ?? 0,
      trend: metrics.map((m) => ({
        date: m.date,
        retention: m.retention_rate,
        churn: 100 - m.retention_rate,
      })),
    };
  }

  /**
   * Gets product performance metrics for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getProductPerformance(startDate: Date, endDate: Date) {
    const metrics = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select([
        'SUM(sm.total_revenue) as revenue',
        'SUM(sm.total_orders) as orders',
        'AVG(sm.average_order_value) as avg_order_value',
        'SUM(sm.views) as views',
        'AVG(CASE WHEN sm.total_orders > 0 THEN sm.views / sm.total_orders ELSE 0 END) as conversion_rate',
        'DATE(sm.date) as date',
      ])
      .where('sm.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(sm.date)')
      .getRawMany<RawProductMetrics>();

    const latestMetrics = metrics[metrics.length - 1];

    return {
      revenue: latestMetrics?.revenue ?? 0,
      orders: latestMetrics?.orders ?? 0,
      views: latestMetrics?.views ?? 0,
      conversionRate: latestMetrics?.conversion_rate ?? 0,
      trend: metrics.map((d) => ({
        date: d.date,
        revenue: d.revenue,
        orders: d.orders,
        views: d.views,
        conversionRate: d.conversion_rate,
      })),
    };
  }

  /**
   * Gets category performance metrics for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getCategoryPerformance(startDate: Date, endDate: Date) {
    const metrics = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select([
        'SUM(sm.total_revenue) as revenue',
        'SUM(sm.total_orders) as orders',
        'AVG(sm.average_order_value) as avg_order_value',
        'COUNT(DISTINCT sm.product_id) as products',
        'DATE(sm.date) as date',
      ])
      .where('sm.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(sm.date)')
      .getRawMany<RawCategoryMetrics>();

    const latestMetrics = metrics[metrics.length - 1];

    return {
      revenue: latestMetrics?.revenue ?? 0,
      orders: latestMetrics?.orders ?? 0,
      products: latestMetrics?.products ?? 0,
      trend: metrics.map((d) => ({
        date: d.date,
        revenue: d.revenue,
        orders: d.orders,
      })),
    };
  }

  /**
   * Gets traffic source distribution
   */
  async getTrafficSourceDistribution() {
    // Get latest traffic source data
    const latestMetrics = await this.customerMetricsRepo.findOne({
      order: {
        date: 'DESC',
      },
    });

    // Get traffic source metrics
    const sources = await this.customerMetricsRepo
      .createQueryBuilder('customer')
      .select([
        'customer.trafficSource as name',
        'COUNT(*) as visits',
        'AVG(CASE WHEN customer.lastPurchaseDate IS NOT NULL THEN 1 ELSE 0 END) * 100 as conversion_rate',
      ])
      .groupBy('customer.trafficSource')
      .getRawMany<RawTrafficSource>();

    return {
      sources: sources.map((source) => ({
        source: source.name,
        visits: source.visits,
        conversion_rate: source.conversion_rate,
      })),
    };
  }

  /**
   * Gets real-time dashboard data including active users and trends
   */
  async getRealTimeDashboard() {
    const current = await this.realTimeMetricsRepo
      .createQueryBuilder('metrics')
      .select([
        'metrics.activeUsers as active_users',
        'metrics.pageViews as page_views',
        'metrics.trafficSources as traffic_sources',
      ])
      .orderBy('metrics.timestamp', 'DESC')
      .limit(1)
      .getRawOne();

    const hourAgo = new Date(Date.now() - 3600000);
    const trends = await this.realTimeMetricsRepo
      .createQueryBuilder('metrics')
      .select([
        'metrics.timestamp as timestamp',
        'metrics.activeUsers as active_users',
        'metrics.pageViews as page_views',
      ])
      .where('metrics.timestamp >= :hourAgo', { hourAgo })
      .orderBy('metrics.timestamp', 'ASC')
      .getRawMany();

    return {
      current: {
        activeUsers: current?.active_users ?? 0,
        pageViews: current?.page_views ?? 0,
        trafficSources: current?.traffic_sources ?? [],
      },
      trends: {
        activeUsers: trends.map((t) => ({
          timestamp: t.timestamp,
          users: t.active_users,
        })),
        pageViews: trends.map((t) => ({
          timestamp: t.timestamp,
          views: t.page_views,
        })),
      },
    };
  }

  /**
   * Aggregates customer segments
   */
  private aggregateCustomerSegments(segments: CustomerSegment[]): SegmentMap {
    return segments.reduce((acc: SegmentMap, segment) => {
      if (!acc[segment.segment]) {
        acc[segment.segment] = {
          customers: 0,
          revenue: 0,
          avg_order_value: 0,
        };
      }

      acc[segment.segment].customers += segment.customer_count;
      acc[segment.segment].revenue += segment.total_revenue;
      acc[segment.segment].avg_order_value =
        acc[segment.segment].revenue / acc[segment.segment].customers;

      return acc;
    }, {});
  }
}
