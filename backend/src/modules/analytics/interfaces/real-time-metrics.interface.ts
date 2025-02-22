export interface RealTimeMetrics {
  id: string;
  timestamp: Date;
  active_users: number;
  active_sessions: number;
  cart_count: number;
  cart_value: number;
  pending_orders: number;
  conversion_rate: number;
  page_views: {
    page: string;
    views: number;
    average_time: number;
  }[];
  traffic_sources: {
    source: string;
    active_users: number;
    conversion_rate: number;
  }[];
  created_at: Date;
  updated_at: Date;
}
