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

  private initializeLogger() {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = environment === 'production';

    // Define log levels and default level per environment
    const defaultLevel = isProduction ? 'error' : 'debug';
    const logLevel = this.configService.get<string>('LOG_LEVEL', defaultLevel);

    // Development format: Colorful, human-readable output
    const developmentFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    );

    // Production format: JSON format with error stacks
    const productionFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Configure transports based on environment
    const transports: winston.transport[] = [];

    if (isProduction) {
      // Production transports
      transports.push(
        // Console for container logs
        new winston.transports.Console({
          format: productionFormat,
          level: 'error', // Only errors to console in production
        }),
        // File rotation for persistent logs
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: productionFormat,
        }),
        // Separate file for all logs
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: productionFormat,
        })
      );
    } else {
      // Development transport
      transports.push(
        new winston.transports.Console({
          format: developmentFormat,
          level: 'debug', // Show all logs in development
        })
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: logLevel,
      levels: winston.config.npm.levels,
      format: isProduction ? productionFormat : developmentFormat,
      transports,
      // Exit on error in production
      exitOnError: isProduction,
    });

    // Initial log to verify configuration
    this.logger.info(`Logging initialized in ${environment} mode at ${logLevel} level`);
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
