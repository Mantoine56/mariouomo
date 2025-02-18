import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import { ResourceMonitoringService } from './resource.monitoring.service';

@Module({
  imports: [ConfigModule],
  providers: [MonitoringService, ResourceMonitoringService],
  exports: [MonitoringService, ResourceMonitoringService],
})
export class MonitoringModule {}
