import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Interface for sales dashboard data from materialized view
 */
interface SalesDashboardData {
  day: Date;
  store_id: string;
  revenue: number;
  orders: number;
  units_sold: number;
  avg_order_value: number;
  discounts: number;
  conversion_rate: number;
}

/**
 * Interface for customer insights data from materialized view
 */
interface CustomerInsightsData {
  day: Date;
  store_id: string;
  new_customers: number;
  returning_customers: number;
  avg_lifetime_value: number;
  retention_rate: number;
  churn_rate: number;
  traffic_source: string;
  data_points: number;
}

/**
 * Interface for inventory status data from materialized view
 */
interface InventoryStatusData {
  day: Date;
  store_id: string;
  total_items: number;
  low_stock: number;
  out_of_stock: number;
  avg_turnover: number;
  total_value: number;
  dead_stock_pct: number;
}

/**
 * Service for querying analytics data from materialized views
 * Provides optimized methods for dashboard data retrieval
 */
@Injectable()
export class AnalyticsMaterializedViewsService {
  private readonly logger = new Logger(AnalyticsMaterializedViewsService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Refreshes all analytics materialized views
   * This should be called periodically to keep views up-to-date
   */
  async refreshMaterializedViews(): Promise<void> {
    try {
      await this.dataSource.query('SELECT refresh_analytics_views()');
      this.logger.log('Successfully refreshed analytics materialized views');
    } catch (error) {
      this.logger.error(`Failed to refresh materialized views: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets sales dashboard data from materialized view
   * @param storeId - Store ID to filter data
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   * @returns Sales dashboard data for the specified period
   */
  async getSalesDashboard(
    storeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SalesDashboardData[]> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM mv_sales_dashboard 
         WHERE store_id = $1 AND day >= $2 AND day <= $3
         ORDER BY day DESC`,
        [storeId, startDate, endDate],
      );
      
      return result.map(row => ({
        day: row.day,
        store_id: row.store_id,
        revenue: parseFloat(row.revenue),
        orders: parseInt(row.orders, 10),
        units_sold: parseInt(row.units_sold, 10),
        avg_order_value: parseFloat(row.avg_order_value),
        discounts: parseFloat(row.discounts),
        conversion_rate: parseFloat(row.conversion_rate),
      }));
    } catch (error) {
      this.logger.error(`Failed to get sales dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets customer insights data from materialized view
   * @param storeId - Store ID to filter data
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   * @param trafficSource - Optional traffic source to filter by
   * @returns Customer insights data for the specified period
   */
  async getCustomerInsights(
    storeId: string,
    startDate: Date,
    endDate: Date,
    trafficSource?: string,
  ): Promise<CustomerInsightsData[]> {
    try {
      let query = `
        SELECT * FROM mv_customer_insights 
        WHERE store_id = $1 AND day >= $2 AND day <= $3
      `;
      
      const params = [storeId, startDate, endDate];
      
      if (trafficSource) {
        query += ` AND traffic_source = $4`;
        params.push(trafficSource);
      }
      
      query += ` ORDER BY day DESC`;
      
      const result = await this.dataSource.query(query, params);
      
      return result.map(row => ({
        day: row.day,
        store_id: row.store_id,
        new_customers: parseInt(row.new_customers, 10),
        returning_customers: parseInt(row.returning_customers, 10),
        avg_lifetime_value: parseFloat(row.avg_lifetime_value),
        retention_rate: parseFloat(row.retention_rate),
        churn_rate: parseFloat(row.churn_rate),
        traffic_source: row.traffic_source,
        data_points: parseInt(row.data_points, 10),
      }));
    } catch (error) {
      this.logger.error(`Failed to get customer insights data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets inventory status data from materialized view
   * @param storeId - Store ID to filter data
   * @param startDate - Start date for the analysis period
   * @param endDate - End date for the analysis period
   * @returns Inventory status data for the specified period
   */
  async getInventoryStatus(
    storeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<InventoryStatusData[]> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM mv_inventory_status 
         WHERE store_id = $1 AND day >= $2 AND day <= $3
         ORDER BY day DESC`,
        [storeId, startDate, endDate],
      );
      
      return result.map(row => ({
        day: row.day,
        store_id: row.store_id,
        total_items: parseInt(row.total_items, 10),
        low_stock: parseInt(row.low_stock, 10),
        out_of_stock: parseInt(row.out_of_stock, 10),
        avg_turnover: parseFloat(row.avg_turnover),
        total_value: parseFloat(row.total_value),
        dead_stock_pct: parseFloat(row.dead_stock_pct),
      }));
    } catch (error) {
      this.logger.error(`Failed to get inventory status data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually triggers the data aggregation process
   * This can be used to force aggregation outside of the scheduled time
   */
  async triggerDataAggregation(): Promise<void> {
    try {
      await this.dataSource.query('SELECT aggregate_monthly_analytics()');
      this.logger.log('Successfully triggered monthly data aggregation');
    } catch (error) {
      this.logger.error(`Failed to trigger data aggregation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually applies the data retention policy
   * This can be used to force cleanup outside of the scheduled time
   */
  async applyDataRetentionPolicy(): Promise<void> {
    try {
      await this.dataSource.query('SELECT apply_data_retention_policy()');
      this.logger.log('Successfully applied data retention policy');
    } catch (error) {
      this.logger.error(`Failed to apply data retention policy: ${error.message}`, error.stack);
      throw error;
    }
  }
}
