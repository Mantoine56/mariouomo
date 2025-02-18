import { ResourceMonitoringConfig } from '../common/monitoring/interfaces/monitoring.interface';

/**
 * Monitoring configuration for resource usage alerts and thresholds.
 * These settings are used to configure alerts in New Relic and monitor system resources.
 * 
 * @remarks
 * - CPU and Memory thresholds are percentages (0-100)
 * - Duration values are in seconds
 * - Redis eviction rate is measured in keys/second
 * - Response times are in milliseconds
 */
export const monitoringConfig: ResourceMonitoringConfig = {
  // CPU Usage thresholds (percentage)
  cpu: {
    warning: Number(process.env.RESOURCE_CPU_WARNING) || 70,    // Alert when CPU usage exceeds 70%
    critical: Number(process.env.RESOURCE_CPU_CRITICAL) || 85,  // Critical alert when CPU usage exceeds 85%
    duration: 300,  // Duration in seconds before triggering alert (5 minutes)
  },

  // Memory Usage thresholds (percentage)
  memory: {
    warning: Number(process.env.RESOURCE_MEMORY_WARNING) || 75,    // Alert when memory usage exceeds 75%
    critical: Number(process.env.RESOURCE_MEMORY_CRITICAL) || 90,  // Critical alert when memory usage exceeds 90%
    duration: 300,  // Duration in seconds before triggering alert (5 minutes)
  },

  // Redis Memory thresholds
  redis: {
    memoryWarning: Number(process.env.RESOURCE_REDIS_MEMORY_WARNING) || 75,     // Alert when Redis memory usage exceeds 75%
    memoryCritical: Number(process.env.RESOURCE_REDIS_MEMORY_CRITICAL) || 90,   // Critical alert when Redis memory usage exceeds 90%
    evictionRate: Number(process.env.RESOURCE_REDIS_EVICTION_RATE) || 100,      // Alert when eviction rate exceeds 100 keys/second
    hitRateWarning: Number(process.env.RESOURCE_REDIS_HIT_RATE_WARNING) || 80,  // Alert when cache hit rate falls below 80%
    duration: 300,         // Duration in seconds before triggering alert (5 minutes)
  },

  // Heroku Dyno scaling thresholds
  dynos: {
    scaleUpThreshold: Number(process.env.RESOURCE_SCALE_UP_THRESHOLD) || 80,   // Scale up when CPU or Memory exceeds 80%
    scaleDownThreshold: Number(process.env.RESOURCE_SCALE_DOWN_THRESHOLD) || 30,// Scale down when CPU and Memory below 30%
    minDynos: Number(process.env.RESOURCE_DYNO_MIN) || 1,          // Minimum number of dynos
    maxDynos: Number(process.env.RESOURCE_DYNO_MAX) || 3,          // Maximum number of dynos
    scaleUpBy: 1,         // Number of dynos to add when scaling up
    scaleDownBy: 1,       // Number of dynos to remove when scaling down
    cooldown: 300,        // Cooldown period between scaling events (5 minutes)
  },

  // Response time thresholds (milliseconds)
  responseTime: {
    warning: 1000,        // Alert when response time exceeds 1 second
    critical: 3000,       // Critical alert when response time exceeds 3 seconds
    duration: 300,        // Duration in seconds before triggering alert (5 minutes)
  },

  // Error rate thresholds (percentage)
  errorRate: {
    warning: 5,           // Alert when error rate exceeds 5%
    critical: 10,         // Critical alert when error rate exceeds 10%
    duration: 300,        // Duration in seconds before triggering alert (5 minutes)
  },
} as const;
