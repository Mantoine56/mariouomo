import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { monitoringConfig } from '../../config/monitoring.config';
import * as newrelic from 'newrelic';
import { 
  AlertConfig, 
  SystemMetrics, 
  RedisMetrics 
} from './interfaces/monitoring.interface';

/**
 * Service responsible for monitoring system resources and setting up alerts.
 * Handles monitoring of:
 * - CPU and Memory usage
 * - Redis performance and health
 * - Response times and error rates
 * - Dyno scaling (in production)
 */
@Injectable()
export class ResourceMonitoringService implements OnModuleInit {
  private readonly isProduction: boolean;
  private readonly logger = new Logger(ResourceMonitoringService.name);

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('environment') === 'production';
  }

  /**
   * Initialize monitoring when the module starts
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing resource monitoring...');

    // Set up New Relic alerts based on our monitoring config
    this.setupCPUAlerts();
    this.setupMemoryAlerts();
    this.setupRedisAlerts();
    this.setupResponseTimeAlerts();
    this.setupErrorRateAlerts();

    // Start periodic resource monitoring
    this.startResourceMonitoring();

    this.logger.log('Resource monitoring initialized successfully');
  }

  /**
   * Set up CPU usage alerts in New Relic
   */
  private setupCPUAlerts(): void {
    const { cpu } = monitoringConfig;
    
    newrelic.addCustomAttribute('cpuWarningThreshold', cpu.warning);
    newrelic.addCustomAttribute('cpuCriticalThreshold', cpu.critical);

    // CPU Warning Alert
    this.createNewRelicAlert({
      name: 'High CPU Usage Warning',
      condition: `cpu.utilization > ${cpu.warning}`,
      duration: cpu.duration,
      priority: 'WARNING',
    });

    // CPU Critical Alert
    this.createNewRelicAlert({
      name: 'High CPU Usage Critical',
      condition: `cpu.utilization > ${cpu.critical}`,
      duration: cpu.duration,
      priority: 'CRITICAL',
    });
  }

  /**
   * Set up memory usage alerts in New Relic
   */
  private setupMemoryAlerts(): void {
    const { memory } = monitoringConfig;

    newrelic.addCustomAttribute('memoryWarningThreshold', memory.warning);
    newrelic.addCustomAttribute('memoryCriticalThreshold', memory.critical);

    // Memory Warning Alert
    this.createNewRelicAlert({
      name: 'High Memory Usage Warning',
      condition: `memory.utilization > ${memory.warning}`,
      duration: memory.duration,
      priority: 'WARNING',
    });

    // Memory Critical Alert
    this.createNewRelicAlert({
      name: 'High Memory Usage Critical',
      condition: `memory.utilization > ${memory.critical}`,
      duration: memory.duration,
      priority: 'CRITICAL',
    });
  }

  /**
   * Set up Redis monitoring alerts in New Relic
   */
  private setupRedisAlerts(): void {
    const { redis } = monitoringConfig;

    // Add custom attributes for thresholds first
    newrelic.addCustomAttribute('alert.High Redis Memory Usage.condition', `redis.memory.utilization > ${redis.memoryWarning}`);
    newrelic.addCustomAttribute('alert.Critical Redis Memory Usage.condition', `redis.memory.utilization > ${redis.memoryCritical}`);
    newrelic.addCustomAttribute('alert.High Redis Eviction Rate.condition', `redis.eviction.rate > ${redis.evictionRate}`);
    newrelic.addCustomAttribute('alert.Low Redis Cache Hit Rate.condition', `redis.cache.hit.rate < ${redis.hitRateWarning}`);

    // Redis Memory Warning Alert
    this.createNewRelicAlert({
      name: 'High Redis Memory Usage',
      condition: `redis.memory.utilization > ${redis.memoryWarning}`,
      duration: redis.duration,
      priority: 'WARNING',
    });

    // Redis Memory Critical Alert
    this.createNewRelicAlert({
      name: 'Critical Redis Memory Usage',
      condition: `redis.memory.utilization > ${redis.memoryCritical}`,
      duration: redis.duration,
      priority: 'CRITICAL',
    });

    // Redis Eviction Rate Alert
    this.createNewRelicAlert({
      name: 'High Redis Eviction Rate',
      condition: `redis.eviction.rate > ${redis.evictionRate}`,
      duration: redis.duration,
      priority: 'WARNING',
    });

    // Redis Cache Hit Rate Alert
    this.createNewRelicAlert({
      name: 'Low Redis Cache Hit Rate',
      condition: `redis.cache.hit.rate < ${redis.hitRateWarning}`,
      duration: redis.duration,
      priority: 'WARNING',
    });
  }

  /**
   * Set up response time alerts in New Relic
   */
  private setupResponseTimeAlerts(): void {
    const { responseTime } = monitoringConfig;

    // Response Time Warning
    this.createNewRelicAlert({
      name: 'High Response Time Warning',
      condition: `response.time > ${responseTime.warning}`,
      duration: responseTime.duration,
      priority: 'WARNING',
    });

    // Response Time Critical
    this.createNewRelicAlert({
      name: 'High Response Time Critical',
      condition: `response.time > ${responseTime.critical}`,
      duration: responseTime.duration,
      priority: 'CRITICAL',
    });
  }

  /**
   * Set up error rate alerts in New Relic
   */
  private setupErrorRateAlerts(): void {
    const { errorRate } = monitoringConfig;

    // Error Rate Warning
    this.createNewRelicAlert({
      name: 'High Error Rate Warning',
      condition: `error.rate > ${errorRate.warning}`,
      duration: errorRate.duration,
      priority: 'WARNING',
    });

    // Error Rate Critical
    this.createNewRelicAlert({
      name: 'High Error Rate Critical',
      condition: `error.rate > ${errorRate.critical}`,
      duration: errorRate.duration,
      priority: 'CRITICAL',
    });
  }

  /**
   * Create a New Relic alert condition
   */
  private createNewRelicAlert(config: AlertConfig): void {
    if (this.isProduction) {
      newrelic.addCustomAttribute(`alert.${config.name}.condition`, config.condition);
      newrelic.addCustomAttribute(`alert.${config.name}.duration`, config.duration);
      newrelic.addCustomAttribute(`alert.${config.name}.priority`, config.priority);
      
      this.logger.debug(`Created New Relic alert: ${config.name}`);
    }
  }

  /**
   * Start periodic resource monitoring
   */
  private startResourceMonitoring(): void {
    const MONITORING_INTERVAL = 60000; // 1 minute

    setInterval(() => {
      this.monitorSystemResources();
      this.monitorRedisResources();
      this.checkDynoScaling();
    }, MONITORING_INTERVAL);

    this.logger.log('Periodic resource monitoring started');
  }

  /**
   * Monitor system resources (CPU, Memory)
   */
  private async monitorSystemResources(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();
      
      newrelic.recordMetric('system.cpu.usage', metrics.cpu);
      newrelic.recordMetric('system.memory.usage', metrics.memory);

      this.logger.debug(`Resource Usage - CPU: ${metrics.cpu}%, Memory: ${metrics.memory}%`);
    } catch (error) {
      this.logger.error('Error monitoring system resources:', error);
    }
  }

  /**
   * Monitor Redis resources
   */
  private async monitorRedisResources(): Promise<void> {
    try {
      const metrics = await this.getRedisMetrics();
      
      newrelic.recordMetric('redis.memory.usage', metrics.memoryUsage);
      newrelic.recordMetric('redis.eviction.rate', metrics.evictionRate);
      newrelic.recordMetric('redis.hit.rate', metrics.hitRate);

      this.logger.debug(
        `Redis Metrics - Memory: ${metrics.memoryUsage}%, ` +
        `Eviction Rate: ${metrics.evictionRate}/s, ` +
        `Hit Rate: ${metrics.hitRate}%`
      );
    } catch (error) {
      this.logger.error('Error monitoring Redis resources:', error);
    }
  }

  /**
   * Check if dyno scaling is needed based on current metrics
   */
  private async checkDynoScaling(): Promise<void> {
    // Only check scaling in production environment
    if (!this.isProduction) {
      this.logger.debug('Skipping dyno scaling check in non-production environment');
      return;
    }

    try {
      const metrics = await this.getSystemMetrics();
      const { cpu, memory } = metrics;
      const config = this.configService.get('monitoring');

      if (!config?.dyno) {
        this.logger.warn('Dyno configuration not found');
        return;
      }

      const { cpuThreshold, memoryThreshold } = config.dyno;

      if (cpu > cpuThreshold || memory > memoryThreshold) {
        await this.scaleDynos('up');
      } else if (cpu < cpuThreshold / 2 && memory < memoryThreshold / 2) {
        await this.scaleDynos('down');
      }
    } catch (error) {
      this.logger.error('Error checking dyno scaling:', error);
      // Only call New Relic if it's available
      if (typeof newrelic !== 'undefined' && newrelic?.noticeError) {
        newrelic.noticeError(error);
      }
    }
  }

  /**
   * Get system metrics (CPU, Memory)
   * @returns Object containing CPU and Memory usage percentages
   */
  private async getSystemMetrics(): Promise<SystemMetrics> {
    // In a real implementation, this would use a system metrics library
    // For now, we'll return placeholder values
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
    };
  }

  /**
   * Get Redis metrics
   * @returns Object containing Redis performance metrics
   */
  private async getRedisMetrics(): Promise<RedisMetrics> {
    // In a real implementation, this would query Redis INFO
    // For now, we'll return placeholder values
    return {
      memoryUsage: Math.random() * 100,
      evictionRate: Math.random() * 200,
      hitRate: Math.random() * 100,
    };
  }

  /**
   * Scale Heroku dynos up or down
   * @param direction - Direction to scale ('up' or 'down')
   */
  private async scaleDynos(direction: 'up' | 'down'): Promise<void> {
    const { dynos } = monitoringConfig;
    
    // In a real implementation, this would use the Heroku API
    // For now, we'll just log the scaling action
    this.logger.log(
      `Scaling dynos ${direction} by ${direction === 'up' ? dynos.scaleUpBy : dynos.scaleDownBy}`
    );
  }
}
