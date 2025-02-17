# File: backend/src/common/monitoring/monitoring.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [ConfigModule],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
