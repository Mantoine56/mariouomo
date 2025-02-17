import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
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
        this.monitoringService.captureException(error);
        return throwError(() => error);
      }),
    );
  }
}
