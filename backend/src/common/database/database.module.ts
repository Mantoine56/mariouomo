import { Module, Global, Logger } from '@nestjs/common';
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
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        logger.log('Initializing database connection...');
        
        const dbUrl = configService.get<string>('DATABASE_URL');
        logger.log(`Database URL: ${dbUrl ? 'Provided' : 'Not provided'}`);
        
        if (dbUrl && dbUrl.includes('.supabase.co')) {
          logger.log('Connecting to Supabase database');
          logger.log('Schema:', configService.get<string>('DATABASE_SCHEMA', 'public'));
        }
        
        return getDatabaseConfig(configService);
      },
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
