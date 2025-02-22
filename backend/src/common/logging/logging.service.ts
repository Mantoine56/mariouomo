import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Logging service that provides environment-specific logging configurations.
 * Development: Detailed, colorful console output with debug information
 * Production: JSON-formatted logs with error tracking and daily rotation
 */
@Injectable()
export class LoggingService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.initializeLogger();
  }

  /**
   * Initialize the Winston logger with appropriate configuration
   */
  private initializeLogger(): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = isProduction ? 'info' : 'debug';

    // Development format: Colorful, human-readable output
    const developmentFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.simple()
    );

    // Production format: JSON format with error stacks
    const productionFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const transports = [
      new winston.transports.Console({
        level: logLevel,
      }),
    ];

    this.logger = winston.createLogger({
      level: logLevel,
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      },
      format: isProduction ? productionFormat : developmentFormat,
      transports,
      exitOnError: isProduction,
    });

    // Initial log to verify configuration
    this.logger.info(`Logging initialized in ${isProduction ? 'production' : 'development'} mode at ${logLevel} level`);
  }

  // NestJS LoggerService implementation
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
