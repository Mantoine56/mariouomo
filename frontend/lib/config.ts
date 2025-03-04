/**
 * Application configuration
 * Centralizes all configuration values and environment variables
 */
export const config = {
  /**
   * API configuration
   */
  api: {
    /**
     * Base URL for the backend API
     */
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    
    /**
     * Default headers for API requests
     */
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
  },
  
  /**
   * Supabase configuration
   */
  supabase: {
    /**
     * Supabase project URL
     */
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    
    /**
     * Supabase anonymous key
     */
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  /**
   * Analytics configuration
   */
  analytics: {
    /**
     * Default time period for analytics
     */
    defaultPeriod: '7d',
    
    /**
     * Available time periods
     */
    periods: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last quarter' },
      { value: 'ytd', label: 'Year to date' },
      { value: 'all', label: 'All time' },
    ],
    
    /**
     * Polling intervals (in milliseconds)
     */
    polling: {
      /**
       * Real-time dashboard data refresh interval
       */
      realtimeInterval: 60000, // 1 minute
      
      /**
       * Dashboard data refresh interval
       */
      dashboardRefreshInterval: 300000, // 5 minutes
    },
  },
  
  /**
   * Feature flags
   */
  features: {
    /**
     * Enable real-time updates
     */
    enableRealtimeUpdates: true,
    
    /**
     * Enable export features (CSV, PDF)
     */
    enableExportFeatures: true,
  },
}; 