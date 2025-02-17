# File: backend/src/common/interceptors/sentry.interceptor.ts

import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Capture the error in Sentry
        this.monitoringService.captureException(error, context.getClass().name);
        
        // Re-throw the error to be handled by the global exception filter
        return throwError(() => error);
      }),
    );
  }
}
