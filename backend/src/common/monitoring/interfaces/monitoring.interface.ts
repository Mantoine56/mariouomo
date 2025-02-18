/**
 * Interface for resource monitoring thresholds and configuration.
 * These settings define when alerts should be triggered for various system resources.
 */
export interface ResourceMonitoringConfig {
  readonly cpu: ResourceThreshold;
  readonly memory: ResourceThreshold;
  readonly redis: RedisThreshold;
  readonly dynos: DynoScalingConfig;
  readonly responseTime: ResponseTimeThreshold;
  readonly errorRate: ErrorRateThreshold;
}

/**
 * Base threshold configuration with warning and critical levels
 */
interface BaseThreshold {
  readonly warning: number;
  readonly critical: number;
  readonly duration: number;
}

/**
 * CPU and Memory threshold configuration
 */
export type ResourceThreshold = BaseThreshold;

/**
 * Redis-specific monitoring thresholds
 */
export interface RedisThreshold extends Omit<BaseThreshold, 'warning' | 'critical'> {
  readonly memoryWarning: number;
  readonly memoryCritical: number;
  readonly evictionRate: number;
  readonly hitRateWarning: number;
}

/**
 * Heroku dyno scaling configuration
 */
export interface DynoScalingConfig {
  readonly scaleUpThreshold: number;
  readonly scaleDownThreshold: number;
  readonly minDynos: number;
  readonly maxDynos: number;
  readonly scaleUpBy: number;
  readonly scaleDownBy: number;
  readonly cooldown: number;
}

/**
 * Response time threshold configuration
 */
export type ResponseTimeThreshold = BaseThreshold;

/**
 * Error rate threshold configuration
 */
export type ErrorRateThreshold = BaseThreshold;

/**
 * Alert configuration for New Relic
 */
export interface AlertConfig {
  readonly name: string;
  readonly condition: string;
  readonly duration: number;
  readonly priority: 'WARNING' | 'CRITICAL';
}

/**
 * System metrics data structure
 */
export interface SystemMetrics {
  readonly cpu: number;
  readonly memory: number;
}

/**
 * Redis metrics data structure
 */
export interface RedisMetrics {
  readonly memoryUsage: number;
  readonly evictionRate: number;
  readonly hitRate: number;
}
