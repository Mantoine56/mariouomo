import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for interacting with Supabase
 * Provides a client for auth, database, and storage operations
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Initialize the Supabase client when the module is initialized
   */
  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    
    this.logger.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
    this.logger.log(`API Key length: ${supabaseKey?.length || 0} characters`);
    this.logger.log(`API Key first 10 chars: ${supabaseKey?.substring(0, 10)}...`);
    
    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Missing Supabase credentials. Please check your environment variables.');
      throw new Error('Missing Supabase credentials');
    }

    try {
      // Create the Supabase client with service role key for admin access
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      this.logger.log('Supabase client initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing Supabase client: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Get the Supabase client instance
   * @returns The Supabase client
   */
  getClient(): SupabaseClient {
    if (!this.supabase) {
      this.logger.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }

  /**
   * Get a user's profile from Supabase
   * @param userId The user ID to get the profile for
   * @returns The user profile or null if not found
   */
  async getUserProfile(userId: string) {
    try {
      this.logger.debug(`Getting user profile for user ID: ${userId}`);
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.error(`Error getting user profile: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error)}`);
        return null;
      }

      this.logger.debug(`User profile data: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Exception getting user profile: ${error.message}`);
      this.logger.error(`Exception stack: ${error.stack}`);
      return null;
    }
  }

  /**
   * Update a user's profile in Supabase
   * @param userId The user ID to update the profile for
   * @param profileData The profile data to update
   * @returns The updated profile or null if the update failed
   */
  async updateUserProfile(userId: string, profileData: any) {
    try {
      this.logger.debug(`Updating user profile for user ID: ${userId}`);
      this.logger.debug(`Profile data: ${JSON.stringify(profileData)}`);
      
      const { data, error } = await this.supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating user profile: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error)}`);
        return null;
      }

      this.logger.debug(`Updated profile data: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Exception updating user profile: ${error.message}`);
      this.logger.error(`Exception stack: ${error.stack}`);
      return null;
    }
  }
} 