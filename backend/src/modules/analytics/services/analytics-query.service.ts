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
  avgOrderValue: number;
}

interface SegmentMap {
  [key: string]: SegmentMetrics;
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
   * Gets sales overview for a date range
   */
  async getSalesOverview(startDate: Date, endDate: Date) {
    const metrics = await this.salesMetricsRepo.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    // Calculate trends and totals
    const totals = metrics.reduce(
      (acc, curr) => ({
        revenue: acc.revenue + curr.total_revenue,
        orders: acc.orders + curr.total_orders,
        units: acc.units + curr.total_units_sold,
        discounts: acc.discounts + curr.discount_amount,
      }),
      { revenue: 0, orders: 0, units: 0, discounts: 0 },
    );

    // Get top products across the period
    const topProducts = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select('jsonb_array_elements(top_products) as product')
      .where('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawMany();

    return {
      metrics,
      totals,
      topProducts,
    };
  }

  /**
   * Gets inventory overview
   */
  async getInventoryOverview(date: Date) {
    const metrics = await this.inventoryMetricsRepo.findOne({
      where: {
        date: LessThanOrEqual(date),
      },
      order: {
        date: 'DESC',
      },
    });

    // Get historical turnover rates
    const turnoverTrend = await this.inventoryMetricsRepo
      .createQueryBuilder('im')
      .select(['date', 'turnover_rate'])
      .where('date <= :date', { date })
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      current: metrics,
      turnoverTrend,
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
          avgOrderValue: 0,
        };
      }

      acc[segment.segment].customers += segment.customer_count;
      acc[segment.segment].revenue += segment.total_revenue;
      acc[segment.segment].avgOrderValue =
        acc[segment.segment].revenue / acc[segment.segment].customers;

      return acc;
    }, {});
  }

  /**
   * Gets customer insights
   */
  async getCustomerInsights(startDate: Date, endDate: Date) {
    const metrics = await this.customerMetricsRepo.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    // Calculate retention trends
    const retentionTrend = metrics.map((m) => ({
      date: m.date,
      retention: m.retention_rate,
      churn: m.churn_rate,
    }));

    // Aggregate customer segments
    const segments = metrics.reduce((acc: SegmentMap, curr) => {
      const aggregatedSegments = this.aggregateCustomerSegments(
        curr.customer_segments,
      );
      return { ...acc, ...aggregatedSegments };
    }, {});

    return {
      metrics,
      retentionTrend,
      segments,
    };
  }

  /**
   * Gets real-time dashboard data
   */
  async getRealTimeDashboard() {
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

    const cartValueTrend = trends.map((t) => ({
      timestamp: t.timestamp,
      value: t.cart_value,
    }));

    return {
      current,
      trends: {
        activeUsers: activeUserTrend,
        cartValue: cartValueTrend,
      },
    };
  }

  /**
   * Gets performance metrics for a specific product
   */
  async getProductPerformance(productId: string, startDate: Date, endDate: Date) {
    // Get sales metrics for the product
    const salesData = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select([
        'date',
        "jsonb_path_query(top_products, '$[*] ? (@.product_id == $productId)')",
      ])
      .where('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameter('productId', productId)
      .getRawMany();

    // Calculate trends
    const trends = salesData.map((d) => ({
      date: d.date,
      units: d.units_sold,
      revenue: d.revenue,
    }));

    return {
      trends,
      totals: trends.reduce(
        (acc, curr) => ({
          units: acc.units + curr.units,
          revenue: acc.revenue + curr.revenue,
        }),
        { units: 0, revenue: 0 },
      ),
    };
  }

  /**
   * Gets category performance metrics
   */
  async getCategoryPerformance(
    categoryId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Get sales metrics for the category
    const salesData = await this.salesMetricsRepo
      .createQueryBuilder('sm')
      .select([
        'date',
        "jsonb_path_query(sales_by_category, '$[*] ? (@.category_id == $categoryId)')",
      ])
      .where('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameter('categoryId', categoryId)
      .getRawMany();

    // Get inventory metrics for the category
    const inventoryData = await this.inventoryMetricsRepo
      .createQueryBuilder('im')
      .select([
        'date',
        "jsonb_path_query(category_metrics, '$[*] ? (@.category_id == $categoryId)')",
      ])
      .where('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameter('categoryId', categoryId)
      .getRawMany();

    return {
      sales: salesData,
      inventory: inventoryData,
    };
  }
}
