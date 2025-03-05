import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { getDatabaseConfig } from '../../config/database.config';
import { DbUtilsService } from './db-utils.service';

/**
 * Global database module that provides connection pooling and transaction management
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
  ],
  providers: [
    DbUtilsService,
    DatabaseService,
  ],
  exports: [
    DbUtilsService,
    DatabaseService,
  ],
})
export class DatabaseModule {}
