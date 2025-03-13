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
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly supabaseService: SupabaseService
  ) {}

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
      
      this.logger.debug(`Supabase profile result: ${profile ? 'Found' : 'Not found'}`);
      if (profile) {
        this.logger.debug(`User profile: ${JSON.stringify({
          id: profile.id,
          email: profile.email,
          role: profile.role
        })}`);
      }
      
      if (!profile) {
        this.logger.warn(`No profile found for user ${userId}, creating one...`);
        
        // Extract user info from Supabase token
        const email = payload.email;
        const name = payload.user_metadata?.full_name || 'User';
        
        if (!email) {
          this.logger.error('No email found in token payload');
          throw new UnauthorizedException('Invalid user token - missing email');
        }
        
        this.logger.debug(`Creating profile with email: ${email}, name: ${name}`);
        
        // Create a basic profile with default values
        const newProfile = {
          id: userId,
          email,
          full_name: name,
          role: Role.USER, // Default to USER role
          status: 'active',
          preferences: { theme: 'light', notifications: true },
          metadata: { provider: 'supabase' }
        };
        
        // Create profile in Supabase
        this.logger.debug(`Updating profile in Supabase: ${JSON.stringify(newProfile)}`);
        const createdProfile = await this.supabaseService.updateUserProfile(userId, newProfile);
        
        if (!createdProfile) {
          this.logger.error('Failed to create user profile');
          throw new UnauthorizedException('Failed to create user profile');
        }
        
        this.logger.debug(`Created new profile with ID: ${createdProfile.id}, role: ${createdProfile.role}`);
        return createdProfile;
      }
      
      return profile;
    } catch (error) {
      this.logger.error(`Error managing user profile: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw new UnauthorizedException(`Error managing user profile: ${error.message}`);
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
      this.logger.debug(`Fetching profile for user ID: ${userId}`);
      const profile = await this.supabaseService.getUserProfile(userId);
      
      if (!profile) {
        this.logger.error(`User profile not found for ID: ${userId}`);
        throw new UnauthorizedException('User profile not found');
      }

      // Return user without sensitive information
      const { metadata, ...userInfo } = profile;
      this.logger.debug(`Retrieved profile for user: ${userInfo.email}, role: ${userInfo.role}`);
      return userInfo;
    } catch (error) {
      this.logger.error(`Error retrieving user profile: ${error.message}`);
      throw new UnauthorizedException(`Error retrieving user profile: ${error.message}`);
    }
  }

  /**
   * Validates a Supabase JWT token
   * @param token The JWT token to validate
   * @returns The decoded token payload
   */
  validateToken(token: string): any {
    try {
      this.logger.debug(`Validating token (length: ${token.length})`);
      const payload = this.jwtService.verify(token);
      this.logger.debug(`Token validation successful, payload has user ID: ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Tests the Supabase connection by attempting to query the profiles table
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
      
      // Return connection details
      return {
        connected: true,
        timestamp: new Date().toISOString(),
        environment: this.configService.get<string>('NODE_ENV'),
        supabaseUrl: this.configService.get<string>('SUPABASE_URL'),
        testQuery: 'Success',
        data
      };
    } catch (error) {
      this.logger.error(`Exception during Supabase connection test: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      
      // Return error details
      return {
        connected: false,
        timestamp: new Date().toISOString(),
        environment: this.configService.get<string>('NODE_ENV'),
        error: error.message
      };
    }
  }
}
