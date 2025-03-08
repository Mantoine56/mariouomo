import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import { UserAddress } from './entities/user-address.entity';
import { Address } from './entities/address.entity';

/**
 * Users Module
 * 
 * Manages user-related functionality including:
 * - User registration and profile management
 * - User authentication and authorization
 * - User preferences and settings
 * - Address management
 * - User roles and permissions
 * - Account history and activity tracking
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      UserAddress,
      Address
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    ProfileController
  ],
  providers: [
    ProfileService
  ],
  exports: [
    ProfileService
  ],
})
export class UsersModule {} 