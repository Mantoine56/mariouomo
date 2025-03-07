/**
 * Swagger documentation for Analytics API endpoints
 * Contains all the decorators and descriptions for the Analytics Controller
 */

// Response models for analytics endpoints
export const SalesMetricsResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
    store_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
    date: { type: 'string', format: 'date-time', example: '2025-03-06T00:00:00.000Z' },
    total_revenue: { type: 'number', format: 'float', example: 12500.75 },
    total_orders: { type: 'integer', example: 125 },
    total_units_sold: { type: 'integer', example: 350 },
    average_order_value: { type: 'number', format: 'float', example: 100.01 },
    top_products: { 
      type: 'array', 
      items: {
        type: 'object',
        properties: {
          product_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
          name: { type: 'string', example: 'Premium Leather Jacket' },
          units_sold: { type: 'integer', example: 45 },
          revenue: { type: 'number', format: 'float', example: 4500.00 }
        }
      }
    },
    sales_by_category: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174003' },
          name: { type: 'string', example: 'Outerwear' },
          units_sold: { type: 'integer', example: 120 },
          revenue: { type: 'number', format: 'float', example: 8500.50 }
        }
      }
    },
    conversion_rate: { type: 'number', format: 'float', example: 3.25 },
    views: { type: 'integer', example: 4500 }
  }
};

export const InventoryMetricsResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174004' },
    store_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
    date: { type: 'string', format: 'date-time', example: '2025-03-06T00:00:00.000Z' },
    total_inventory_value: { type: 'number', format: 'float', example: 85000.00 },
    total_items_in_stock: { type: 'integer', example: 1250 },
    low_stock_items: { type: 'integer', example: 15 },
    out_of_stock_items: { type: 'integer', example: 3 },
    turnover_rate: { type: 'number', format: 'float', example: 2.5 },
    stock_by_location: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          location: { type: 'string', example: 'warehouse-1' },
          items: { type: 'integer', example: 750 },
          value: { type: 'number', format: 'float', example: 45000.00 }
        }
      }
    },
    category_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174003' },
          name: { type: 'string', example: 'Outerwear' },
          items_in_stock: { type: 'integer', example: 350 },
          value: { type: 'number', format: 'float', example: 28000.00 },
          turnover_rate: { type: 'number', format: 'float', example: 3.1 }
        }
      }
    }
  }
};

export const CustomerMetricsResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174005' },
    store_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
    date: { type: 'string', format: 'date-time', example: '2025-03-06T00:00:00.000Z' },
    total_customers: { type: 'integer', example: 850 },
    new_customers: { type: 'integer', example: 35 },
    returning_customers: { type: 'integer', example: 815 },
    average_purchase_frequency: { type: 'number', format: 'float', example: 2.3 },
    customer_lifetime_value: { type: 'number', format: 'float', example: 450.75 },
    traffic_sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string', example: 'google' },
          customers: { type: 'integer', example: 320 },
          conversion_rate: { type: 'number', format: 'float', example: 4.2 }
        }
      }
    },
    customer_segments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          segment: { type: 'string', example: 'high-value' },
          customers: { type: 'integer', example: 120 },
          average_order_value: { type: 'number', format: 'float', example: 250.00 },
          purchase_frequency: { type: 'number', format: 'float', example: 3.5 }
        }
      }
    },
    last_purchase_date: { type: 'string', format: 'date-time', example: '2025-03-06T15:30:00.000Z' }
  }
};

// Request DTOs for analytics endpoints
export const DateRangeRequestSchema = {
  type: 'object',
  properties: {
    start_date: { type: 'string', format: 'date', example: '2025-03-01' },
    end_date: { type: 'string', format: 'date', example: '2025-03-06' },
    store_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' }
  },
  required: ['start_date', 'end_date', 'store_id']
};

export const MetricsFilterRequestSchema = {
  type: 'object',
  properties: {
    store_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
    start_date: { type: 'string', format: 'date', example: '2025-03-01' },
    end_date: { type: 'string', format: 'date', example: '2025-03-06' },
    product_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
    category_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174003' },
    location: { type: 'string', example: 'warehouse-1' },
    traffic_source: { type: 'string', example: 'google' }
  },
  required: ['store_id']
};

// API operation descriptions
export const ApiOperationDescriptions = {
  getSalesMetrics: 'Retrieves sales metrics for a specific store within a date range',
  getInventoryMetrics: 'Retrieves inventory metrics for a specific store within a date range',
  getCustomerMetrics: 'Retrieves customer metrics for a specific store within a date range',
  getDashboardSummary: 'Retrieves a summary of all metrics for the dashboard',
  triggerAggregation: 'Manually triggers aggregation of metrics for a specific date',
  getTopProducts: 'Retrieves the top-selling products for a specific store within a date range',
  getSalesByCategory: 'Retrieves sales data grouped by product category',
  getInventoryTurnover: 'Retrieves inventory turnover rates for products',
  getCustomerSegments: 'Retrieves customer segmentation data',
  getTrafficSources: 'Retrieves traffic source analytics data'
};

// API response descriptions
export const ApiResponseDescriptions = {
  salesMetrics: 'Sales metrics retrieved successfully',
  inventoryMetrics: 'Inventory metrics retrieved successfully',
  customerMetrics: 'Customer metrics retrieved successfully',
  dashboardSummary: 'Dashboard summary retrieved successfully',
  aggregationTriggered: 'Metrics aggregation triggered successfully',
  unauthorized: 'Unauthorized access - valid authentication credentials required',
  forbidden: 'Forbidden - insufficient permissions to access this resource',
  badRequest: 'Bad request - invalid parameters provided',
  notFound: 'Resource not found',
  serverError: 'Internal server error occurred'
};

// Security schemes
export const SecuritySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter JWT token'
  }
};
