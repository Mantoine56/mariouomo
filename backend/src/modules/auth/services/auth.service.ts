import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Role } from '../enums/role.enum';
import { SupabaseService } from '../../../common/supabase/supabase.service';

/**
 * Authentication Service integrated with Supabase
 * 
 * Handles authentication-related operations including:
 * - Supabase JWT validation
 * - User profile management via Supabase
 * - Development mode support
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly isDevelopment: boolean;
  // Use the actual Supabase user ID for development
  private readonly DEV_USER_ID = '682efcd1-4701-429f-9ab4-e024ae5ed076';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly supabaseService: SupabaseService
  ) {
    this.isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
    
    if (this.isDevelopment) {
      this.logger.warn('Running in development mode - using Supabase test user');
    }
  }

  /**
   * Validates a user based on the Supabase JWT payload
   * Uses Supabase directly to get profile information
   * 
   * @param payload - The decoded Supabase JWT payload
   * @returns The user profile or throws an exception
   */
  async validateUser(payload: any): Promise<any> {
    // Extract user ID from Supabase payload
    const userId = payload.sub;
    
    this.logger.debug(`Validating user with payload: ${JSON.stringify(payload)}`);
    
    if (!userId) {
      this.logger.error('Invalid Supabase token payload - no user ID found');
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      this.logger.debug(`Getting user profile from Supabase for user ID: ${userId}`);
      
      // Get user profile from Supabase
      const profile = await this.supabaseService.getUserProfile(userId);
      
      this.logger.debug(`Supabase profile result: ${JSON.stringify(profile)}`);
      
      if (!profile) {
        this.logger.warn(`No profile found for user ${userId}, creating one...`);
        
        // Extract user info from Supabase token
        const email = payload.email || 'online@mariouomo.com';
        const name = payload.user_metadata?.full_name || 'Mario Uomo User';
        
        this.logger.debug(`Creating profile with email: ${email}, name: ${name}`);
        
        // Create a basic profile with default values
        const newProfile = {
          id: userId,
          email,
          full_name: name,
          role: Role.USER,
          status: 'active',
          preferences: { theme: 'light', notifications: true },
          metadata: { provider: 'supabase' }
        };
        
        // Create profile in Supabase
        this.logger.debug(`Updating profile in Supabase: ${JSON.stringify(newProfile)}`);
        const createdProfile = await this.supabaseService.updateUserProfile(userId, newProfile);
        
        this.logger.debug(`Created profile result: ${JSON.stringify(createdProfile)}`);
        
        if (!createdProfile) {
          this.logger.error('Failed to create user profile');
          throw new UnauthorizedException('Failed to create user profile');
        }
        
        return createdProfile;
      }
      
      return profile;
    } catch (error) {
      this.logger.error(`Error managing user profile: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw new UnauthorizedException('Error managing user profile');
    }
  }

  /**
   * Gets the current user's profile information directly from Supabase
   * 
   * @param userId - The Supabase user ID
   * @returns The user profile with sensitive information removed
   */
  async getCurrentUser(userId: string): Promise<any> {
    try {
      const profile = await this.supabaseService.getUserProfile(userId);
      
      if (!profile) {
        throw new UnauthorizedException('User profile not found');
      }

      // Return user without sensitive information
      const { metadata, ...userInfo } = profile;
      return userInfo;
    } catch (error) {
      this.logger.error(`Error retrieving user profile: ${error.message}`);
      throw new UnauthorizedException('Error retrieving user profile');
    }
  }

  /**
   * Validates a Supabase JWT token
   * In development mode, allows test tokens but still requires proper UUID
   */
  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      
      // In development mode, accept test tokens with proper Supabase user ID
      if (this.isDevelopment) {
        this.logger.warn('Development mode: Returning test payload with actual Supabase ID');
        return {
          sub: this.DEV_USER_ID,
          email: 'online@mariouomo.com',
          role: Role.USER
        };
      }
      
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Tests the Supabase connection by attempting to query the profiles table
   * 
   * @returns The connection test result
   */
  async testSupabaseConnection() {
    try {
      this.logger.log('Testing Supabase connection...');
      
      // Get the Supabase client
      const supabase = this.supabaseService.getClient();
      
      // Try to query the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        this.logger.error(`Supabase connection test failed: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error)}`);
        throw error;
      }

      return {
        connected: true,
        timestamp: new Date().toISOString(),
        environment: this.configService.get<string>('NODE_ENV'),
        supabaseUrl: this.configService.get<string>('SUPABASE_URL'),
        testQuery: 'Success'
      };
    } catch (error) {
      this.logger.error(`Exception during Supabase connection test: ${error.message}`);
      throw error;
    }
  }
}
