import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { Profile } from '../users/entities/profile.entity';

/**
 * Authentication Module
 * 
 * Handles user authentication, authorization, and security features
 * including JWT token management, guards, and decorators.
 * 
 * This module is configured to work with Supabase Authentication.
 * In development mode, it will use a placeholder JWT secret and
 * mock authentication to facilitate testing.
 */
@Module({
  imports: [
    // Import TypeORM module for Profile entity
    TypeOrmModule.forFeature([Profile]),
    
    // Configure Passport with JWT as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Configure JWT module with dynamic secret retrieval
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Try different possible environment variable names for the JWT secret
        const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET') || 
                          configService.get<string>('JWT_SECRET') || 
                          configService.get<string>('SUPABASE_JWT_PUBLIC_KEY') ||
                          'development_jwt_secret_for_testing';
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [SupabaseJwtStrategy, AuthService],
  exports: [JwtModule, SupabaseJwtStrategy, AuthService],
})
export class AuthModule {} 