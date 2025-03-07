import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SalesMetrics } from '../entities/sales-metrics.entity';
import { InventoryMetrics } from '../entities/inventory-metrics.entity';
import { CustomerMetrics } from '../entities/customer-metrics.entity';
import { RealTimeMetrics } from '../entities/real-time-metrics.entity';

/**
 * Type definitions for event payloads
 * Ensures type safety throughout the analytics collection process
 */
interface OrderCreatedPayload {
  id: string;
  total: number;
  store_id: string;
  customer_id: string;
  traffic_source?: string;
  items: Array<{
    id: string;
    product_id: string;
    category_id: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  views?: number;
  discount_total?: number;
}

interface InventoryUpdatePayload {
  store_id: string;
  product_id: string;
  category_id: string;
  quantity_change: number;
  current_quantity: number;
  low_stock_threshold?: number;
  location?: string;
  value_per_unit: number;
}

interface CustomerActivityPayload {
  store_id: string;
  customer_id: string;
  activity_type: 'view' | 'signup' | 'purchase' | 'return' | 'cart' | 'wishlist';
  traffic_source?: string;
  purchase_date?: Date;
  value?: number;
  product_id?: string;
  category_id?: string;
  is_returning: boolean;
}

/**
 * Service responsible for collecting and storing analytics data
 * Listens to various events and updates metrics accordingly
 */
@Injectable()
export class AnalyticsCollectorService {
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
   * Handles order creation events
   * Updates sales and customer metrics with store-specific data
   */
  @OnEvent('order.created')
  async handleOrderCreated(payload: OrderCreatedPayload) {
    await this.dataSource.transaction(async (manager) => {
      // Update sales metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find store-specific metrics for today
      let salesMetrics = await manager.findOne(SalesMetrics, {
        where: { 
          date: today,
          store_id: payload.store_id 
        },
      });

      if (!salesMetrics) {
        // Create new metrics record with store_id
        salesMetrics = manager.create(SalesMetrics, {
          date: today,
          store_id: payload.store_id,
          total_revenue: 0,
          total_orders: 0,
          total_units_sold: 0,
          discount_amount: 0,
          conversion_rate: 0,
          views: 0,
          top_products: [],
          sales_by_category: [],
        });
      }

      // Update basic metrics
      salesMetrics.total_revenue += payload.total;
      salesMetrics.total_orders += 1;
      salesMetrics.total_units_sold += payload.items.reduce(
        (sum: number, item) => sum + item.quantity,
        0,
      );
      salesMetrics.average_order_value =
        salesMetrics.total_revenue / salesMetrics.total_orders;
      
      // Update discount amount if available
      if (payload.discount_total) {
        salesMetrics.discount_amount += payload.discount_total;
      }
      
      // Update views if provided and recalculate conversion rate
      if (payload.views && payload.views > 0) {
        salesMetrics.views += payload.views;
        salesMetrics.conversion_rate = 
          (salesMetrics.total_orders / salesMetrics.views) * 100;
      }

      // Process each item to update product and category specific data
      for (const item of payload.items) {
        // Update product-specific metrics
        await this.updateProductMetrics(
          manager, 
          payload.store_id,
          item.product_id, 
          item.quantity,
          item.price * item.quantity
        );
        
        // Update category-specific metrics  
        await this.updateCategoryMetrics(
          manager, 
          payload.store_id,
          item.category_id, 
          item.quantity,
          item.price * item.quantity
        );
        
        // Update top products list
        this.updateTopProductsList(salesMetrics, item);
        
        // Update sales by category
        this.updateSalesByCategoryList(salesMetrics, item);
      }

      await manager.save(SalesMetrics, salesMetrics);

      // Update customer metrics if customer_id is provided
      if (payload.customer_id) {
        await this.updateCustomerMetricsForPurchase(
          manager,
          payload.store_id,
          payload.customer_id,
          payload.total,
          payload.traffic_source,
          today
        );
      }

      // Emit event for real-time updates
      this.eventEmitter.emit('analytics.sales.updated', {
        ...salesMetrics,
        store_id: payload.store_id
      });
    });
  }

  /**
   * Handles inventory update events
   * Updates inventory metrics with store-specific data
   */
  @OnEvent('inventory.updated')
  async handleInventoryUpdated(payload: InventoryUpdatePayload) {
    await this.dataSource.transaction(async (manager) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find store-specific inventory metrics
      let inventoryMetrics = await manager.findOne(InventoryMetrics, {
        where: { 
          date: today,
          store_id: payload.store_id 
        },
      });

      if (!inventoryMetrics) {
        inventoryMetrics = manager.create(InventoryMetrics, {
          date: today,
          store_id: payload.store_id,
          turnover_rate: 0,
          total_sku_count: 0,
          low_stock_items: 0,
          out_of_stock_items: 0,
          inventory_value: 0,
          dead_stock_percentage: 0,
          stock_by_location: [],
          category_metrics: [],
        });
      }

      // Calculate inventory value change
      const valueChange = payload.quantity_change * payload.value_per_unit;
      inventoryMetrics.inventory_value += valueChange;

      // Update low stock and out of stock counts
      if (payload.low_stock_threshold && payload.current_quantity > 0 && 
          payload.current_quantity <= payload.low_stock_threshold) {
        inventoryMetrics.low_stock_items += 1;
      }
      
      if (payload.current_quantity <= 0) {
        inventoryMetrics.out_of_stock_items += 1;
      }

      // Update location-specific inventory if provided
      if (payload.location) {
        this.updateStockByLocation(
          inventoryMetrics, 
          payload.location, 
          payload.quantity_change,
          valueChange
        );
      }

      // Update category metrics
      this.updateInventoryCategoryMetrics(
        inventoryMetrics,
        payload.category_id,
        payload.quantity_change,
        valueChange
      );

      await manager.save(InventoryMetrics, inventoryMetrics);

      // Emit event for real-time updates
      this.eventEmitter.emit('analytics.inventory.updated', {
        ...inventoryMetrics,
        store_id: payload.store_id
      });
    });
  }

  /**
   * Handles customer activity events
   * Updates customer metrics with store-specific data and traffic source
   */
  @OnEvent('customer.activity')
  async handleCustomerActivity(payload: CustomerActivityPayload) {
    await this.dataSource.transaction(async (manager) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find store-specific customer metrics
      let customerMetrics = await manager.findOne(CustomerMetrics, {
        where: { 
          date: today,
          store_id: payload.store_id 
        },
      });

      if (!customerMetrics) {
        customerMetrics = manager.create(CustomerMetrics, {
          date: today,
          store_id: payload.store_id,
          traffic_source: payload.traffic_source || 'direct',
          new_customers: 0,
          returning_customers: 0,
          customer_lifetime_value: 0,
          retention_rate: 0,
          churn_rate: 0,
          purchase_frequency: [],
          customer_segments: [],
          geographic_distribution: [],
        });
      }

      // Update customer counts based on activity type
      if (payload.activity_type === 'signup') {
        customerMetrics.new_customers += 1;
      } else if (payload.activity_type === 'purchase' && payload.is_returning) {
        customerMetrics.returning_customers += 1;
        
        // Update last purchase date if it's a purchase activity
        if (payload.purchase_date) {
          customerMetrics.last_purchase_date = payload.purchase_date;
        }
      }

      // Update customer segments and geographic distribution as needed
      // This would require additional data in the payload
      
      await manager.save(CustomerMetrics, customerMetrics);

      // If this is a product view, update the product views count
      if (payload.activity_type === 'view' && payload.product_id) {
        await this.updateProductViews(
          manager, 
          payload.store_id, 
          payload.product_id
        );
      }

      // Emit event for real-time updates
      this.eventEmitter.emit('analytics.customer.updated', {
        ...customerMetrics,
        store_id: payload.store_id,
        traffic_source: payload.traffic_source
      });
    });
  }

  /**
   * Updates real-time metrics with store-specific data
   * Called periodically to update current platform status
   */
  async updateRealTimeMetrics(store_id: string, traffic_sources: any[] = []) {
    await this.dataSource.transaction(async (manager) => {
      const realTimeMetrics = manager.create(RealTimeMetrics, {
        timestamp: new Date(),
        store_id: store_id,
        active_users: 0,
        active_sessions: 0,
        cart_count: 0,
        cart_value: 0,
        pending_orders: 0,
        pending_revenue: 0,
        current_popular_products: [],
        traffic_sources: traffic_sources || [],
        page_views: [],
      });

      // Update metrics with real-time data from various sources
      // This implementation would depend on real-time data collection services

      await manager.save(RealTimeMetrics, realTimeMetrics);

      // Emit event for real-time updates
      this.eventEmitter.emit('analytics.realtime.updated', {
        ...realTimeMetrics,
        store_id: store_id
      });
    });
  }

  /**
   * Aggregates daily metrics for a specific store
   * Called at the end of each day
   */
  async aggregateDailyMetrics(date: Date, store_id: string) {
    await this.dataSource.transaction(async (manager) => {
      // Aggregate sales metrics for the store
      const salesMetrics = await this.aggregateSalesMetrics(date, store_id, manager);
      if (salesMetrics) {
        await manager.save(SalesMetrics, salesMetrics);
      }

      // Aggregate inventory metrics for the store
      const inventoryMetrics = await this.aggregateInventoryMetrics(date, store_id, manager);
      if (inventoryMetrics) {
        await manager.save(InventoryMetrics, inventoryMetrics);
      }

      // Aggregate customer metrics for the store
      const customerMetrics = await this.aggregateCustomerMetrics(date, store_id, manager);
      if (customerMetrics) {
        await manager.save(CustomerMetrics, customerMetrics);
      }

      // Emit aggregation complete event
      this.eventEmitter.emit('analytics.daily.aggregated', {
        date,
        store_id,
        sales: salesMetrics,
        inventory: inventoryMetrics,
        customer: customerMetrics,
      });
    });
  }

  /**
   * Helper method to aggregate sales metrics for a specific store
   * Performs complex aggregation of sales data for the specified date and store
   * @private
   */
  private async aggregateSalesMetrics(date: Date, store_id: string, manager: any) {
    // Set time to beginning of day for accurate date comparison
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Create a new aggregated metrics record
    const aggregatedMetrics = manager.create(SalesMetrics, {
      date: startDate,
      store_id: store_id,
      total_revenue: 0,
      total_orders: 0,
      total_units_sold: 0,
      average_order_value: 0,
      discount_amount: 0,
      conversion_rate: 0,
      views: 0,
      top_products: [],
      sales_by_category: []
    });
    
    // Get all sales metrics for the date range and store
    const dailyMetrics = await manager.find(SalesMetrics, {
      where: {
        store_id: store_id,
        created_at: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
    
    if (dailyMetrics.length === 0) {
      return aggregatedMetrics; // Return empty metrics if no data found
    }
    
    // Aggregate basic metrics
    let totalViews = 0;
    const productMap = new Map();
    const categoryMap = new Map();
    
    for (const metric of dailyMetrics) {
      // Aggregate numeric metrics
      aggregatedMetrics.total_revenue += metric.total_revenue || 0;
      aggregatedMetrics.total_orders += metric.total_orders || 0;
      aggregatedMetrics.total_units_sold += metric.total_units_sold || 0;
      aggregatedMetrics.discount_amount += metric.discount_amount || 0;
      aggregatedMetrics.views += metric.views || 0;
      totalViews += metric.views || 0;
      
      // Aggregate product data
      if (metric.top_products && metric.top_products.length > 0) {
        for (const product of metric.top_products) {
          const existing = productMap.get(product.product_id);
          if (existing) {
            existing.units_sold += product.units_sold;
            existing.revenue += product.revenue;
          } else {
            productMap.set(product.product_id, {
              product_id: product.product_id,
              units_sold: product.units_sold,
              revenue: product.revenue
            });
          }
        }
      }
      
      // Aggregate category data
      if (metric.sales_by_category && metric.sales_by_category.length > 0) {
        for (const category of metric.sales_by_category) {
          const existing = categoryMap.get(category.category_id);
          if (existing) {
            existing.units_sold += category.units_sold;
            existing.revenue += category.revenue;
          } else {
            categoryMap.set(category.category_id, {
              category_id: category.category_id,
              units_sold: category.units_sold,
              revenue: category.revenue
            });
          }
        }
      }
    }
    
    // Calculate derived metrics
    if (aggregatedMetrics.total_orders > 0) {
      aggregatedMetrics.average_order_value = 
        aggregatedMetrics.total_revenue / aggregatedMetrics.total_orders;
    }
    
    if (totalViews > 0) {
      aggregatedMetrics.conversion_rate = 
        (aggregatedMetrics.total_orders / totalViews) * 100;
    }
    
    // Set top products (sorted by revenue)
    aggregatedMetrics.top_products = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Limit to top 10
    
    // Set sales by category
    aggregatedMetrics.sales_by_category = Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);
    
    return aggregatedMetrics;
  }

  /**
   * Helper method to aggregate inventory metrics for a specific store
   * Performs complex aggregation of inventory data for the specified date and store
   * @private
   */
  private async aggregateInventoryMetrics(date: Date, store_id: string, manager: any) {
    // Set time to beginning of day for accurate date comparison
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Create a new aggregated metrics record
    const aggregatedMetrics = manager.create(InventoryMetrics, {
      date: startDate,
      store_id: store_id,
      turnover_rate: 0,
      total_sku_count: 0,
      low_stock_items: 0,
      out_of_stock_items: 0,
      inventory_value: 0,
      dead_stock_percentage: 0,
      stock_by_location: [],
      category_metrics: []
    });
    
    // Get all inventory metrics for the date range and store
    const dailyMetrics = await manager.find(InventoryMetrics, {
      where: {
        store_id: store_id,
        created_at: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
    
    if (dailyMetrics.length === 0) {
      return aggregatedMetrics; // Return empty metrics if no data found
    }
    
    // Aggregate basic metrics
    let totalTurnoverRate = 0;
    let totalDeadStockPercentage = 0;
    const locationMap = new Map();
    const categoryMap = new Map();
    
    for (const metric of dailyMetrics) {
      // Aggregate numeric metrics (taking latest values for some metrics)
      aggregatedMetrics.total_sku_count = Math.max(aggregatedMetrics.total_sku_count, metric.total_sku_count || 0);
      aggregatedMetrics.low_stock_items = Math.max(aggregatedMetrics.low_stock_items, metric.low_stock_items || 0);
      aggregatedMetrics.out_of_stock_items = Math.max(aggregatedMetrics.out_of_stock_items, metric.out_of_stock_items || 0);
      aggregatedMetrics.inventory_value = Math.max(aggregatedMetrics.inventory_value, metric.inventory_value || 0);
      
      // For rates, we'll take the average
      if (metric.turnover_rate) {
        totalTurnoverRate += metric.turnover_rate;
      }
      
      if (metric.dead_stock_percentage) {
        totalDeadStockPercentage += metric.dead_stock_percentage;
      }
      
      // Aggregate location data
      if (metric.stock_by_location && metric.stock_by_location.length > 0) {
        for (const location of metric.stock_by_location) {
          const existing = locationMap.get(location.location);
          if (existing) {
            // Take the latest values
            existing.total_items = location.total_items;
            existing.total_value = location.total_value;
          } else {
            locationMap.set(location.location, {
              location: location.location,
              total_items: location.total_items,
              total_value: location.total_value
            });
          }
        }
      }
      
      // Aggregate category metrics
      if (metric.category_metrics && metric.category_metrics.length > 0) {
        for (const category of metric.category_metrics) {
          const existing = categoryMap.get(category.category_id);
          if (existing) {
            // Take the latest values
            existing.stock_value = category.stock_value;
            existing.turnover_rate = category.turnover_rate;
          } else {
            categoryMap.set(category.category_id, {
              category_id: category.category_id,
              turnover_rate: category.turnover_rate,
              stock_value: category.stock_value
            });
          }
        }
      }
    }
    
    // Calculate average rates
    if (dailyMetrics.length > 0) {
      aggregatedMetrics.turnover_rate = totalTurnoverRate / dailyMetrics.length;
      aggregatedMetrics.dead_stock_percentage = totalDeadStockPercentage / dailyMetrics.length;
    }
    
    // Set location data
    aggregatedMetrics.stock_by_location = Array.from(locationMap.values());
    
    // Set category metrics
    aggregatedMetrics.category_metrics = Array.from(categoryMap.values());
    
    return aggregatedMetrics;
  }

  /**
   * Helper method to aggregate customer metrics for a specific store
   * Performs complex aggregation of customer data for the specified date and store
   * @private
   */
  private async aggregateCustomerMetrics(date: Date, store_id: string, manager: any) {
    // Set time to beginning of day for accurate date comparison
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Create a new aggregated metrics record
    const aggregatedMetrics = manager.create(CustomerMetrics, {
      date: startDate,
      store_id: store_id,
      new_customers: 0,
      returning_customers: 0,
      customer_lifetime_value: 0,
      retention_rate: 0,
      churn_rate: 0,
      purchase_frequency: [],
      customer_segments: [],
      geographic_distribution: [],
      last_purchase_date: null
    });
    
    // Get all customer metrics for the date range and store
    const dailyMetrics = await manager.find(CustomerMetrics, {
      where: {
        store_id: store_id,
        created_at: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
    
    if (dailyMetrics.length === 0) {
      return aggregatedMetrics; // Return empty metrics if no data found
    }
    
    // Aggregate basic metrics
    let totalRetentionRate = 0;
    let totalChurnRate = 0;
    let latestPurchaseDate = null;
    const frequencyMap = new Map();
    const segmentMap = new Map();
    const regionMap = new Map();
    const trafficSourceMap = new Map();
    
    for (const metric of dailyMetrics) {
      // Aggregate numeric metrics
      aggregatedMetrics.new_customers += metric.new_customers || 0;
      aggregatedMetrics.returning_customers += metric.returning_customers || 0;
      
      // For CLV, we'll calculate a weighted average based on customer count
      const customerCount = (metric.new_customers || 0) + (metric.returning_customers || 0);
      if (customerCount > 0 && metric.customer_lifetime_value) {
        aggregatedMetrics.customer_lifetime_value = 
          ((aggregatedMetrics.customer_lifetime_value * 
            (aggregatedMetrics.new_customers + aggregatedMetrics.returning_customers - customerCount)) + 
           (metric.customer_lifetime_value * customerCount)) / 
          (aggregatedMetrics.new_customers + aggregatedMetrics.returning_customers);
      }
      
      // For rates, we'll take the average
      if (metric.retention_rate) {
        totalRetentionRate += metric.retention_rate;
      }
      
      if (metric.churn_rate) {
        totalChurnRate += metric.churn_rate;
      }
      
      // Track the latest purchase date
      if (metric.last_purchase_date) {
        if (!latestPurchaseDate || metric.last_purchase_date > latestPurchaseDate) {
          latestPurchaseDate = metric.last_purchase_date;
        }
      }
      
      // Aggregate purchase frequency data
      if (metric.purchase_frequency && metric.purchase_frequency.length > 0) {
        for (const frequency of metric.purchase_frequency) {
          const existing = frequencyMap.get(frequency.frequency);
          if (existing) {
            existing.customer_count += frequency.customer_count;
            existing.revenue += frequency.revenue;
          } else {
            frequencyMap.set(frequency.frequency, {
              frequency: frequency.frequency,
              customer_count: frequency.customer_count,
              revenue: frequency.revenue
            });
          }
        }
      }
      
      // Aggregate customer segment data
      if (metric.customer_segments && metric.customer_segments.length > 0) {
        for (const segment of metric.customer_segments) {
          const existing = segmentMap.get(segment.segment);
          if (existing) {
            existing.customer_count += segment.customer_count;
            existing.total_revenue += segment.total_revenue;
            
            // Recalculate average order value
            if (existing.customer_count > 0) {
              existing.average_order_value = existing.total_revenue / existing.customer_count;
            }
          } else {
            segmentMap.set(segment.segment, {
              segment: segment.segment,
              customer_count: segment.customer_count,
              total_revenue: segment.total_revenue,
              average_order_value: segment.average_order_value
            });
          }
        }
      }
      
      // Aggregate geographic distribution data
      if (metric.geographic_distribution && metric.geographic_distribution.length > 0) {
        for (const region of metric.geographic_distribution) {
          const existing = regionMap.get(region.region);
          if (existing) {
            existing.customer_count += region.customer_count;
            existing.revenue += region.revenue;
          } else {
            regionMap.set(region.region, {
              region: region.region,
              customer_count: region.customer_count,
              revenue: region.revenue
            });
          }
        }
      }
      
      // Track traffic sources
      if (metric.traffic_source) {
        const source = metric.traffic_source;
        trafficSourceMap.set(source, (trafficSourceMap.get(source) || 0) + 1);
      }
    }
    
    // Calculate average rates
    if (dailyMetrics.length > 0) {
      aggregatedMetrics.retention_rate = totalRetentionRate / dailyMetrics.length;
      aggregatedMetrics.churn_rate = totalChurnRate / dailyMetrics.length;
    }
    
    // Set the latest purchase date
    aggregatedMetrics.last_purchase_date = latestPurchaseDate;
    
    // Set the most common traffic source
    let maxCount = 0;
    let mostCommonSource = 'direct';
    
    trafficSourceMap.forEach((count, source) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonSource = source;
      }
    });
    
    aggregatedMetrics.traffic_source = mostCommonSource;
    
    // Set purchase frequency data
    aggregatedMetrics.purchase_frequency = Array.from(frequencyMap.values());
    
    // Set customer segment data
    aggregatedMetrics.customer_segments = Array.from(segmentMap.values());
    
    // Set geographic distribution data
    aggregatedMetrics.geographic_distribution = Array.from(regionMap.values());
    
    return aggregatedMetrics;
  }

  /**
   * Helper method to update product-specific metrics
   * @private
   */
  private async updateProductMetrics(
    manager: any, 
    store_id: string,
    product_id: string, 
    quantity: number, 
    revenue: number
  ) {
    // Find or create product-specific metrics
    let productMetrics = await manager.findOne(SalesMetrics, {
      where: {
        store_id: store_id,
        product_id: product_id,
        date: new Date()
      }
    });

    if (!productMetrics) {
      productMetrics = manager.create(SalesMetrics, {
        date: new Date(),
        store_id: store_id,
        product_id: product_id,
        total_revenue: 0,
        total_orders: 0,
        total_units_sold: 0,
        views: 0,
        conversion_rate: 0,
      });
    }

    productMetrics.total_revenue += revenue;
    productMetrics.total_units_sold += quantity;
    productMetrics.total_orders += 1;
    
    // Calculate conversion rate if views exist
    if (productMetrics.views > 0) {
      productMetrics.conversion_rate = 
        (productMetrics.total_orders / productMetrics.views) * 100;
    }

    await manager.save(SalesMetrics, productMetrics);
  }

  /**
   * Helper method to update category-specific metrics
   * @private
   */
  private async updateCategoryMetrics(
    manager: any,
    store_id: string, 
    category_id: string, 
    quantity: number, 
    revenue: number
  ) {
    // Find or create category-specific metrics
    let categoryMetrics = await manager.findOne(SalesMetrics, {
      where: {
        store_id: store_id,
        category_id: category_id,
        date: new Date()
      }
    });

    if (!categoryMetrics) {
      categoryMetrics = manager.create(SalesMetrics, {
        date: new Date(),
        store_id: store_id,
        category_id: category_id,
        total_revenue: 0,
        total_units_sold: 0,
        total_orders: 0,
        views: 0,
        conversion_rate: 0,
      });
    }

    categoryMetrics.total_revenue += revenue;
    categoryMetrics.total_units_sold += quantity;
    categoryMetrics.total_orders += 1;
    
    await manager.save(SalesMetrics, categoryMetrics);
  }

  /**
   * Helper method to update top products list in sales metrics
   * @private
   */
  private updateTopProductsList(salesMetrics: SalesMetrics, item: OrderCreatedPayload['items'][0]) {
    if (!salesMetrics.top_products) {
      salesMetrics.top_products = [];
    }
    
    const existingIndex = salesMetrics.top_products.findIndex(
      (p) => p.product_id === item.product_id
    );
    
    if (existingIndex >= 0) {
      // Update existing product in the list
      salesMetrics.top_products[existingIndex].units_sold += item.quantity;
      salesMetrics.top_products[existingIndex].revenue += item.price * item.quantity;
    } else {
      // Add new product to the list
      salesMetrics.top_products.push({
        product_id: item.product_id,
        units_sold: item.quantity,
        revenue: item.price * item.quantity,
      });
    }
    
    // Sort by revenue in descending order and limit to top 10
    salesMetrics.top_products.sort((a, b) => b.revenue - a.revenue);
    if (salesMetrics.top_products.length > 10) {
      salesMetrics.top_products = salesMetrics.top_products.slice(0, 10);
    }
  }

  /**
   * Helper method to update sales by category list in sales metrics
   * @private
   */
  private updateSalesByCategoryList(salesMetrics: SalesMetrics, item: OrderCreatedPayload['items'][0]) {
    if (!salesMetrics.sales_by_category) {
      salesMetrics.sales_by_category = [];
    }
    
    const existingIndex = salesMetrics.sales_by_category.findIndex(
      (c) => c.category_id === item.category_id
    );
    
    if (existingIndex >= 0) {
      // Update existing category in the list
      salesMetrics.sales_by_category[existingIndex].units_sold += item.quantity;
      salesMetrics.sales_by_category[existingIndex].revenue += item.price * item.quantity;
    } else {
      // Add new category to the list
      salesMetrics.sales_by_category.push({
        category_id: item.category_id,
        units_sold: item.quantity,
        revenue: item.price * item.quantity,
      });
    }
  }

  /**
   * Helper method to update customer metrics for purchase
   * @private
   */
  private async updateCustomerMetricsForPurchase(
    manager: any,
    store_id: string,
    customer_id: string,
    purchaseValue: number,
    traffic_source?: string,
    purchaseDate?: Date
  ) {
    let customerMetrics = await manager.findOne(CustomerMetrics, {
      where: {
        store_id: store_id,
        date: new Date()
      }
    });

    if (!customerMetrics) {
      customerMetrics = manager.create(CustomerMetrics, {
        date: new Date(),
        store_id: store_id,
        traffic_source: traffic_source || 'direct',
        new_customers: 0,
        returning_customers: 0,
        customer_lifetime_value: 0,
        last_purchase_date: purchaseDate || new Date(),
        retention_rate: 0,
        churn_rate: 0,
      });
    }

    // Update metrics
    customerMetrics.customer_lifetime_value = 
      (customerMetrics.customer_lifetime_value * 
        (customerMetrics.new_customers + customerMetrics.returning_customers) +
        purchaseValue) / 
      (customerMetrics.new_customers + customerMetrics.returning_customers + 1);

    // Update last purchase date if provided
    if (purchaseDate) {
      customerMetrics.last_purchase_date = purchaseDate;
    }

    await manager.save(CustomerMetrics, customerMetrics);
  }

  /**
   * Helper method to update stock by location in inventory metrics
   * @private
   */
  private updateStockByLocation(
    inventoryMetrics: InventoryMetrics,
    location: string,
    quantityChange: number,
    valueChange: number
  ) {
    if (!inventoryMetrics.stock_by_location) {
      inventoryMetrics.stock_by_location = [];
    }
    
    const existingIndex = inventoryMetrics.stock_by_location.findIndex(
      (l) => l.location === location
    );
    
    if (existingIndex >= 0) {
      // Update existing location in the list
      inventoryMetrics.stock_by_location[existingIndex].total_items += quantityChange;
      inventoryMetrics.stock_by_location[existingIndex].total_value += valueChange;
    } else {
      // Add new location to the list
      inventoryMetrics.stock_by_location.push({
        location: location,
        total_items: quantityChange,
        total_value: valueChange,
      });
    }
  }

  /**
   * Helper method to update category metrics in inventory metrics
   * @private
   */
  private updateInventoryCategoryMetrics(
    inventoryMetrics: InventoryMetrics,
    category_id: string,
    quantityChange: number,
    valueChange: number
  ) {
    if (!inventoryMetrics.category_metrics) {
      inventoryMetrics.category_metrics = [];
    }
    
    const existingIndex = inventoryMetrics.category_metrics.findIndex(
      (c) => c.category_id === category_id
    );
    
    if (existingIndex >= 0) {
      // Update existing category in the list
      inventoryMetrics.category_metrics[existingIndex].stock_value += valueChange;
      // Turnover rate calculation would need additional sales data
    } else {
      // Add new category to the list
      inventoryMetrics.category_metrics.push({
        category_id: category_id,
        turnover_rate: 0, // This would be calculated with additional data
        stock_value: valueChange,
      });
    }
  }

  /**
   * Helper method to update product views count
   * @private
   */
  private async updateProductViews(
    manager: any,
    store_id: string,
    product_id: string
  ) {
    let productMetrics = await manager.findOne(SalesMetrics, {
      where: {
        store_id: store_id,
        product_id: product_id,
        date: new Date()
      }
    });

    if (!productMetrics) {
      productMetrics = manager.create(SalesMetrics, {
        date: new Date(),
        store_id: store_id,
        product_id: product_id,
        total_revenue: 0,
        total_orders: 0,
        total_units_sold: 0,
        views: 0,
        conversion_rate: 0,
      });
    }

    // Increment views
    productMetrics.views += 1;
    
    // Recalculate conversion rate if applicable
    if (productMetrics.total_orders > 0) {
      productMetrics.conversion_rate = 
        (productMetrics.total_orders / productMetrics.views) * 100;
    }

    await manager.save(SalesMetrics, productMetrics);
  }
}
