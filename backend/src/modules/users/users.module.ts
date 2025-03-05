import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      // User entities will be registered here
    ]),
  ],
  controllers: [
    // User controllers will be registered here
  ],
  providers: [
    // User services will be registered here
  ],
  exports: [
    // Exported services
  ],
})
export class UsersModule {} 