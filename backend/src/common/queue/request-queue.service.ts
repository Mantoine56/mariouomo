import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as newrelic from 'newrelic';
import { queueConfigs } from '../../config/queue.config';

/**
 * Service for handling request queuing and processing
 * Manages different queues for various request priorities
 */
@Injectable()
export class RequestQueueService implements OnModuleInit {
  private readonly logger = new Logger(RequestQueueService.name);

  constructor(
    @InjectQueue(queueConfigs.highPriority.name)
    private readonly highPriorityQueue: Queue,
    @InjectQueue(queueConfigs.default.name)
    private readonly defaultQueue: Queue,
    @InjectQueue(queueConfigs.background.name)
    private readonly backgroundQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize queue monitoring and handlers
   */
  async onModuleInit() {
    this.logger.log('Initializing request queue service...');

    // Set up queue event handlers
    this.setupQueueHandlers(this.highPriorityQueue);
    this.setupQueueHandlers(this.defaultQueue);
    this.setupQueueHandlers(this.backgroundQueue);

    // Start queue monitoring
    await this.startQueueMonitoring();

    this.logger.log('Request queue service initialized');
  }

  /**
   * Add a request to the appropriate queue based on priority
   * @param data - Request data to be processed
   * @param priority - Priority level (high, default, background)
   */
  async addToQueue(
    data: Record<string, any>,
    priority: 'high' | 'default' | 'background' = 'default',
  ): Promise<Job> {
    const queue = this.getQueueByPriority(priority);
    const jobOptions = {
      ...this.getJobOptions(priority),
    };

    const job = await queue.add('process', data, jobOptions);

    this.logger.debug(
      `Added job ${job.id} to ${priority} queue`,
      { jobId: job.id, priority, data },
    );

    return job;
  }

  /**
   * Get queue instance based on priority
   */
  private getQueueByPriority(priority: string): Queue {
    switch (priority) {
      case 'high':
        return this.highPriorityQueue;
      case 'background':
        return this.backgroundQueue;
      default:
        return this.defaultQueue;
    }
  }

  /**
   * Get job options based on priority
   */
  private getJobOptions(priority: string) {
    switch (priority) {
      case 'high':
        return queueConfigs.highPriority.defaultJobOptions;
      case 'background':
        return queueConfigs.background.defaultJobOptions;
      default:
        return queueConfigs.default.defaultJobOptions;
    }
  }

  /**
   * Set up event handlers for a queue
   */
  private setupQueueHandlers(queue: Queue) {
    queue.on('completed', (job) => {
      this.logger.debug(
        `Job ${job.id} completed in ${Date.now() - job.timestamp}ms`,
        { jobId: job.id, queueName: queue.name },
      );
      this.recordMetrics(queue.name, 'completed', job);
    });

    queue.on('failed', (job, error) => {
      this.logger.error(
        `Job ${job.id} failed: ${error.message}`,
        { jobId: job.id, queueName: queue.name, error },
      );
      this.recordMetrics(queue.name, 'failed', job);
    });

    queue.on('stalled', (jobId) => {
      this.logger.warn(
        `Job ${jobId} stalled`,
        { jobId, queueName: queue.name },
      );
      this.recordMetrics(queue.name, 'stalled');
    });
  }

  /**
   * Start monitoring queue metrics
   */
  private async startQueueMonitoring() {
    const MONITORING_INTERVAL = 60000; // 1 minute

    setInterval(async () => {
      await this.monitorQueue(this.highPriorityQueue);
      await this.monitorQueue(this.defaultQueue);
      await this.monitorQueue(this.backgroundQueue);
    }, MONITORING_INTERVAL);

    this.logger.log('Queue monitoring started');
  }

  /**
   * Monitor a specific queue's metrics
   */
  private async monitorQueue(queue: Queue) {
    try {
      const [
        jobCounts,
        completedCount,
        failedCount,
      ] = await Promise.all([
        queue.getJobCounts(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      // Record metrics in New Relic
      newrelic.recordMetric(`queue.${queue.name}.waiting`, jobCounts.waiting);
      newrelic.recordMetric(`queue.${queue.name}.active`, jobCounts.active);
      newrelic.recordMetric(`queue.${queue.name}.completed`, completedCount);
      newrelic.recordMetric(`queue.${queue.name}.failed`, failedCount);

      this.logger.debug(`Queue metrics for ${queue.name}`, {
        queueName: queue.name,
        metrics: { jobCounts, completedCount, failedCount },
      });
    } catch (error) {
      this.logger.error(`Error monitoring queue ${queue.name}`, error);
    }
  }

  /**
   * Record metrics for queue events
   */
  private recordMetrics(
    queueName: string,
    event: 'completed' | 'failed' | 'stalled',
    job?: Job,
  ) {
    newrelic.recordMetric(`queue.${queueName}.${event}`, 1);
    
    if (job) {
      const processingTime = Date.now() - job.timestamp;
      newrelic.recordMetric(`queue.${queueName}.processingTime`, processingTime);
    }
  }
}
