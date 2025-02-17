import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class MonitoringService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const sentryDsn = this.configService.get<string>('SENTRY_DSN');

    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment,
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express(),
          new Sentry.Integrations.Postgres(),
        ],
      });
    }
  }

  captureException(error: Error, context?: string) {
    Sentry.captureException(error, {
      tags: { context },
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  startTransaction(context: string, operation: string) {
    return Sentry.startTransaction({
      name: context,
      op: operation,
    });
  }
}
