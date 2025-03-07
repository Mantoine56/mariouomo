import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to enhance analytics features with:
 * 1. Materialized views for complex dashboard queries
 * 2. Data retention policies
 * 3. Functions for automated aggregation processes
 */
export class EnhanceAnalyticsFeatures1709770000 implements MigrationInterface {
  /**
   * Run the migration - create materialized views, functions, and policies
   * @param queryRunner QueryRunner instance
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create materialized view for sales dashboard
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_dashboard AS
      SELECT 
        date_trunc('day', date) AS day,
        store_id,
        SUM(total_revenue) AS revenue,
        SUM(total_orders) AS orders,
        SUM(total_units_sold) AS units_sold,
        CASE 
          WHEN SUM(total_orders) > 0 THEN SUM(total_revenue) / SUM(total_orders)
          ELSE 0
        END AS avg_order_value,
        SUM(discount_amount) AS discounts,
        CASE 
          WHEN SUM(views) > 0 THEN (SUM(total_orders)::float / SUM(views)) * 100
          ELSE 0
        END AS conversion_rate
      FROM 
        sales_metrics
      GROUP BY 
        date_trunc('day', date), store_id
      ORDER BY 
        day DESC;
    `);

    // Create index on the materialized view
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_dashboard_day_store 
      ON mv_sales_dashboard(day, store_id);
    `);

    // Create materialized view for customer insights
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_customer_insights AS
      SELECT 
        date_trunc('day', date) AS day,
        store_id,
        SUM(new_customers) AS new_customers,
        SUM(returning_customers) AS returning_customers,
        AVG(customer_lifetime_value) AS avg_lifetime_value,
        AVG(retention_rate) AS retention_rate,
        AVG(churn_rate) AS churn_rate,
        traffic_source,
        COUNT(*) AS data_points
      FROM 
        customer_metrics
      GROUP BY 
        date_trunc('day', date), store_id, traffic_source
      ORDER BY 
        day DESC;
    `);

    // Create index on the customer insights materialized view
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_customer_insights 
      ON mv_customer_insights(day, store_id, COALESCE(traffic_source, ''));
    `);

    // Create materialized view for inventory status
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_status AS
      SELECT 
        date_trunc('day', date) AS day,
        store_id,
        SUM(total_sku_count) AS total_items,
        SUM(low_stock_items) AS low_stock,
        SUM(out_of_stock_items) AS out_of_stock,
        AVG(turnover_rate) AS avg_turnover,
        SUM(inventory_value) AS total_value,
        AVG(dead_stock_percentage) AS dead_stock_pct
      FROM 
        inventory_metrics
      GROUP BY 
        date_trunc('day', date), store_id
      ORDER BY 
        day DESC;
    `);

    // Create index on the inventory status materialized view
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_status 
      ON mv_inventory_status(day, store_id);
    `);

    // Create function to refresh materialized views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_analytics_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_dashboard;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_insights;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_status;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create function for data aggregation (daily to monthly)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION aggregate_monthly_analytics()
      RETURNS void AS $$
      DECLARE
        current_month date := date_trunc('month', current_date);
        previous_month date := date_trunc('month', current_date - interval '1 month');
      BEGIN
        -- Aggregate sales metrics
        INSERT INTO sales_metrics (
          date, store_id, total_revenue, total_orders, average_order_value,
          total_units_sold, discount_amount, conversion_rate, views, created_at, updated_at
        )
        SELECT 
          previous_month as date,
          store_id,
          SUM(total_revenue) as total_revenue,
          SUM(total_orders) as total_orders,
          CASE 
            WHEN SUM(total_orders) > 0 THEN SUM(total_revenue) / SUM(total_orders)
            ELSE 0
          END as average_order_value,
          SUM(total_units_sold) as total_units_sold,
          SUM(discount_amount) as discount_amount,
          CASE 
            WHEN SUM(views) > 0 THEN (SUM(total_orders)::float / SUM(views)) * 100
            ELSE 0
          END as conversion_rate,
          SUM(views) as views,
          now() as created_at,
          now() as updated_at
        FROM 
          sales_metrics
        WHERE 
          date >= previous_month AND date < current_month
        GROUP BY 
          store_id
        ON CONFLICT (date, store_id) 
        WHERE date = previous_month
        DO UPDATE SET
          total_revenue = EXCLUDED.total_revenue,
          total_orders = EXCLUDED.total_orders,
          average_order_value = EXCLUDED.average_order_value,
          total_units_sold = EXCLUDED.total_units_sold,
          discount_amount = EXCLUDED.discount_amount,
          conversion_rate = EXCLUDED.conversion_rate,
          views = EXCLUDED.views,
          updated_at = now();

        -- Similar aggregations for customer and inventory metrics can be added here
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create data retention policy function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION apply_data_retention_policy()
      RETURNS void AS $$
      DECLARE
        retention_date date := current_date - interval '2 years';
        aggregation_date date := current_date - interval '90 days';
      BEGIN
        -- Delete real-time metrics older than 90 days
        DELETE FROM real_time_metrics 
        WHERE timestamp < (current_timestamp - interval '90 days');
        
        -- For detailed daily data older than 90 days but newer than 2 years,
        -- we keep only the first day of each month for historical trends
        DELETE FROM sales_metrics
        WHERE 
          date < aggregation_date AND 
          date > retention_date AND
          date_part('day', date) != 1;
          
        DELETE FROM customer_metrics
        WHERE 
          date < aggregation_date AND 
          date > retention_date AND
          date_part('day', date) != 1;
          
        DELETE FROM inventory_metrics
        WHERE 
          date < aggregation_date AND 
          date > retention_date AND
          date_part('day', date) != 1;
          
        -- Delete all data older than retention period (2 years)
        DELETE FROM sales_metrics WHERE date < retention_date;
        DELETE FROM customer_metrics WHERE date < retention_date;
        DELETE FROM inventory_metrics WHERE date < retention_date;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create cron job entries for scheduled tasks (requires pg_cron extension)
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Check if pg_cron extension exists
        IF EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
        ) THEN
          -- Refresh materialized views every hour
          PERFORM cron.schedule('0 * * * *', 'SELECT refresh_analytics_views()');
          
          -- Run monthly aggregation on the 1st of each month
          PERFORM cron.schedule('0 0 1 * *', 'SELECT aggregate_monthly_analytics()');
          
          -- Apply data retention policy weekly
          PERFORM cron.schedule('0 0 * * 0', 'SELECT apply_data_retention_policy()');
        END IF;
      END $$;
    `);
  }

  /**
   * Revert the migration - drop materialized views and functions
   * @param queryRunner QueryRunner instance
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove cron jobs if pg_cron extension exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
        ) THEN
          PERFORM cron.unschedule('SELECT refresh_analytics_views()');
          PERFORM cron.unschedule('SELECT aggregate_monthly_analytics()');
          PERFORM cron.unschedule('SELECT apply_data_retention_policy()');
        END IF;
      END $$;
    `);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS apply_data_retention_policy();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS aggregate_monthly_analytics();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS refresh_analytics_views();`);

    // Drop materialized views
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_inventory_status;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_customer_insights;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_sales_dashboard;`);
  }
}
