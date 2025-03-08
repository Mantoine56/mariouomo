import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Use the same connection logic but now it will automatically
        // connect to the test database when NODE_ENV=test because
        // we've already updated the .env.test file with the proper DATABASE_URL
        return getDatabaseConfig(configService);
      },
    }),
  ],
})
export class DatabaseModule {} 