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
    try {
      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      // Add index hint for better performance
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
        .orderBy('DATE(sm.date)', 'ASC') // Ensure consistent ordering
        .getRawMany<RawSalesMetrics>();

      // Calculate summary metrics
      const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.revenue || 0), 0);
      const totalOrders = metrics.reduce((sum, m) => sum + Number(m.orders || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        revenue: totalRevenue,
        orders: totalOrders,
        averageOrderValue: avgOrderValue,
        trend: metrics.map((m) => ({
          date: m.date,
          revenue: Number(m.revenue || 0),
          orders: Number(m.orders || 0),
          averageOrderValue: Number(m.avg_order_value || 0),
        })),
        dateRange: {
          startDate,
          endDate,
        }
      };
    } catch (error) {
      console.error('Error in getSalesOverview:', error);
      return {
        error: 'Failed to retrieve sales overview',
        message: error.message,
        revenue: 0,
        orders: 0,
        averageOrderValue: 0,
        trend: [],
        dateRange: {
          startDate,
          endDate,
        }
      };
    }
  }

  /**
   * Gets inventory analytics overview for a specific date
   * @param date - Date for inventory analysis
   */
  async getInventoryOverview(date: Date) {
    try {
      // Validate date
      if (!date || isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
      }
      
      // Get current metrics
      const currentMetrics = await this.inventoryMetricsRepo
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
      
      // Get trend data for the last 30 days
      const thirtyDaysAgo = new Date(date);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const trendMetrics = await this.inventoryMetricsRepo
        .createQueryBuilder('im')
        .select([
          'AVG(im.turnover_rate) as turnover_rate',
          'DATE(im.date) as date',
        ])
        .where('im.date BETWEEN :startDate AND :endDate', {
          startDate: thirtyDaysAgo,
          endDate: date,
        })
        .groupBy('DATE(im.date)')
        .orderBy('DATE(im.date)', 'ASC')
        .getRawMany();
      
      return {
        current: {
          totalItems: Number(currentMetrics?.total_items ?? 0),
          lowStockItems: Number(currentMetrics?.low_stock_items ?? 0),
          outOfStockItems: Number(currentMetrics?.out_of_stock_items ?? 0),
          turnoverRate: Number(currentMetrics?.turnover_rate ?? 0),
        },
        turnoverTrend: trendMetrics.length > 0 
          ? trendMetrics.map(m => ({
              date: m.date,
              turnoverRate: Number(m.turnover_rate ?? 0),
            }))
          : [{
              date: date,
              turnoverRate: Number(currentMetrics?.turnover_rate ?? 0),
            }],
        analysisDate: date,
      };
    } catch (error) {
      console.error('Error in getInventoryOverview:', error);
      return {
        error: 'Failed to retrieve inventory overview',
        message: error.message,
        current: {
          totalItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          turnoverRate: 0,
        },
        turnoverTrend: [],
        analysisDate: date,
      };
    }
  }

  /**
   * Gets customer insights for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getCustomerInsights(startDate: Date, endDate: Date) {
    try {
      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      // Use snake_case column names for consistency with database schema
      const metrics = await this.customerMetricsRepo
        .createQueryBuilder('customer')
        .select([
          'COUNT(DISTINCT CASE WHEN customer.last_purchase_date BETWEEN :startDate AND :endDate THEN customer.id END) as repeat_customers',
          'COUNT(DISTINCT CASE WHEN customer.created_at BETWEEN :startDate AND :endDate THEN customer.id END) as new_customers',
          'AVG(CASE WHEN customer.last_purchase_date >= :startDate THEN 1 ELSE 0 END) * 100 as retention_rate',
          'DATE(customer.created_at) as date',
        ])
        .where('customer.created_at <= :endDate', { startDate, endDate })
        .groupBy('DATE(customer.created_at)')
        .getRawMany<RawCustomerMetrics>();

      // Handle empty result set
      if (metrics.length === 0) {
        return {
          retention: 0,
          churn: 100,
          newCustomers: 0,
          repeatCustomers: 0,
          trend: [],
          dateRange: {
            startDate,
            endDate
          }
        };
      }

      const latestMetrics = metrics[metrics.length - 1];
      const retention = Number(latestMetrics?.retention_rate ?? 0);

      return {
        retention,
        churn: 100 - retention,
        newCustomers: Number(latestMetrics?.new_customers ?? 0),
        repeatCustomers: Number(latestMetrics?.repeat_customers ?? 0),
        trend: metrics.map((m) => ({
          date: m.date,
          retention: Number(m.retention_rate ?? 0),
          churn: 100 - Number(m.retention_rate ?? 0),
        })),
        dateRange: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Error in getCustomerInsights:', error);
      return {
        error: 'Failed to retrieve customer insights',
        message: error.message,
        retention: 0,
        churn: 100,
        newCustomers: 0,
        repeatCustomers: 0,
        trend: [],
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets product performance metrics for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getProductPerformance(startDate: Date, endDate: Date) {
    try {
      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

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

      // Handle empty result set
      if (metrics.length === 0) {
        return {
          revenue: 0,
          orders: 0,
          views: 0,
          conversionRate: 0,
          trend: [],
          dateRange: {
            startDate,
            endDate
          }
        };
      }

      const latestMetrics = metrics[metrics.length - 1];

      return {
        revenue: Number(latestMetrics?.revenue ?? 0),
        orders: Number(latestMetrics?.orders ?? 0),
        views: Number(latestMetrics?.views ?? 0),
        conversionRate: Number(latestMetrics?.conversion_rate ?? 0),
        trend: metrics.map((d) => ({
          date: d.date,
          revenue: Number(d.revenue ?? 0),
          orders: Number(d.orders ?? 0),
          views: Number(d.views ?? 0),
          conversionRate: Number(d.conversion_rate ?? 0),
        })),
        dateRange: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Error in getProductPerformance:', error);
      return {
        error: 'Failed to retrieve product performance metrics',
        message: error.message,
        revenue: 0,
        orders: 0,
        views: 0,
        conversionRate: 0,
        trend: [],
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets category performance metrics for a date range
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   */
  async getCategoryPerformance(startDate: Date, endDate: Date) {
    try {
      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

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

      // Handle empty result set
      if (metrics.length === 0) {
        return {
          revenue: 0,
          orders: 0,
          products: 0,
          trend: [],
          dateRange: {
            startDate,
            endDate
          }
        };
      }

      const latestMetrics = metrics[metrics.length - 1];

      return {
        revenue: Number(latestMetrics?.revenue ?? 0),
        orders: Number(latestMetrics?.orders ?? 0),
        products: Number(latestMetrics?.products ?? 0),
        trend: metrics.map((d) => ({
          date: d.date,
          revenue: Number(d.revenue ?? 0),
          orders: Number(d.orders ?? 0),
        })),
        dateRange: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Error in getCategoryPerformance:', error);
      return {
        error: 'Failed to retrieve category performance metrics',
        message: error.message,
        revenue: 0,
        orders: 0,
        products: 0,
        trend: [],
        dateRange: {
          startDate,
          endDate
        }
      };
    }
  }

  /**
   * Gets traffic source distribution
   * @param startDate - Optional start date for filtering traffic sources
   * @param endDate - Optional end date for filtering traffic sources
   */
  async getTrafficSourceDistribution(startDate?: Date, endDate?: Date) {
    try {
      // Set default date range if not provided
      const effectiveEndDate = endDate || new Date();
      const effectiveStartDate = startDate || new Date(effectiveEndDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      
      // Get traffic source metrics with proper date filtering
      const query = this.customerMetricsRepo
        .createQueryBuilder('customer')
        .select([
          'customer.traffic_source as name', // Using snake_case column name
          'COUNT(*) as visits',
          'AVG(CASE WHEN customer.last_purchase_date IS NOT NULL THEN 1 ELSE 0 END) * 100 as conversion_rate',
        ])
        .where('customer.created_at IS NOT NULL'); // Ensure we have valid records
      
      // Add date range conditions
      // Always use the date range parameters to ensure consistent filtering
      query.andWhere('customer.created_at BETWEEN :startDate AND :endDate', {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
      });
      
      const sources = await query
        .groupBy('customer.traffic_source')
        .getRawMany<RawTrafficSource>();

      // Ensure we have proper type conversion
      return {
        sources: sources.map((source) => ({
          source: source.name || 'Unknown',
          visits: Number(source.visits || 0),
          conversion_rate: Number(source.conversion_rate || 0),
        })),
        dateRange: {
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
        }
      };
    } catch (error) {
      console.error('Error in getTrafficSourceDistribution:', error);
      return {
        sources: [],
        error: 'Failed to retrieve traffic source distribution',
        message: error.message,
        dateRange: {
          startDate: startDate || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate || new Date(),
        }
      };
    }
  }

  /**
   * Gets real-time dashboard data including active users and trends
   * @returns Dashboard data with active users and trends
   */
  async getRealTimeDashboard() {
    try {
      // Validate and optimize the query for current metrics
      const current = await this.realTimeMetricsRepo
        .createQueryBuilder('metrics')
        .select([
          'metrics.activeUsers as active_users',
          'metrics.pageViews as page_views',
          'metrics.trafficSources as traffic_sources',
          'metrics.timestamp as timestamp'
        ])
        .orderBy('metrics.timestamp', 'DESC')
        .limit(1)
        .getRawOne();

      // Calculate the time one hour ago for trend data
      const hourAgo = new Date(Date.now() - 3600000);
      
      // Get trend data for the last hour with consistent time intervals
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

      // Parse traffic sources from JSON if needed
      let trafficSources = [];
      try {
        if (current?.traffic_sources) {
          // Handle both string JSON and already parsed objects
          if (typeof current.traffic_sources === 'string') {
            trafficSources = JSON.parse(current.traffic_sources);
          } else {
            trafficSources = current.traffic_sources;
          }
        }
      } catch (parseError) {
        console.error('Error parsing traffic sources:', parseError);
        trafficSources = [];
      }

      return {
        current: {
          activeUsers: Number(current?.active_users ?? 0),
          pageViews: Number(current?.page_views ?? 0),
          trafficSources: trafficSources,
          timestamp: current?.timestamp ? new Date(current.timestamp) : new Date()
        },
        trends: {
          activeUsers: trends.map((t) => ({
            timestamp: t.timestamp,
            users: Number(t.active_users ?? 0),
          })),
          pageViews: trends.map((t) => ({
            timestamp: t.timestamp,
            views: Number(t.page_views ?? 0),
          })),
        },
      };
    } catch (error) {
      console.error('Error in getRealTimeDashboard:', error);
      return {
        error: 'Failed to retrieve real-time dashboard data',
        message: error.message,
        current: {
          activeUsers: 0,
          pageViews: 0,
          trafficSources: [],
          timestamp: new Date()
        },
        trends: {
          activeUsers: [],
          pageViews: [],
        },
      };
    }
  }

  /**
   * Aggregates customer segments into a structured format
   * @param segments - Array of customer segments with metrics
   * @returns Aggregated segment map with calculated metrics
   */
  private aggregateCustomerSegments(segments: CustomerSegment[]): SegmentMap {
    // Handle empty segments array
    if (!segments || segments.length === 0) {
      return {};
    }
    
    return segments.reduce((acc: SegmentMap, segment) => {
      // Ensure segment name exists and use default if not
      const segmentName = segment.segment || 'Unknown';
      
      if (!acc[segmentName]) {
        acc[segmentName] = {
          customers: 0,
          revenue: 0,
          avg_order_value: 0,
        };
      }

      // Use Number() to ensure proper type conversion
      const customerCount = Number(segment.customer_count || 0);
      const totalRevenue = Number(segment.total_revenue || 0);

      // Update segment metrics
      acc[segmentName].customers += customerCount;
      acc[segmentName].revenue += totalRevenue;
      
      // Calculate average order value safely (avoid division by zero)
      acc[segmentName].avg_order_value = acc[segmentName].customers > 0 
        ? acc[segmentName].revenue / acc[segmentName].customers 
        : 0;

      return acc;
    }, {});
  }
}
