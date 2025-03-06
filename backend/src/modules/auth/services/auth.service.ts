import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Role } from '../enums/role.enum';

/**
 * Authentication Service
 * 
 * Handles authentication-related operations including:
 * - User validation
 * - Mock user creation for development
 * - Token validation and verification
 * - User profile retrieval
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly isDevelopment: boolean;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {
    // Determine if we're in development mode
    this.isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
    
    if (this.isDevelopment) {
      this.logger.warn('Running in development mode - authentication will be flexible');
    }
  }

  /**
   * Validates a user based on the payload from the JWT token
   * In development mode, creates a mock user if no user is found
   * 
   * @param payload - The decoded JWT payload
   * @returns The user profile or throws an exception
   */
  async validateUser(payload: any): Promise<Profile> {
    // Extract user ID from the payload
    const userId = payload.sub || payload.user_id || payload.id;
    
    if (!userId) {
      this.logger.error('Invalid token payload - no user ID found');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Try to find the user in the database
    let user = await this.profileRepository.findOne({ where: { id: userId } });

    // In development mode, create a mock user if none exists
    if (!user && this.isDevelopment) {
      this.logger.warn(`Creating mock user for development with ID: ${userId}`);
      
      // Create a mock admin user for development
      // Include both old and new field names for compatibility
      user = this.profileRepository.create({
        id: userId,
        email: payload.email || 'dev@example.com',
        full_name: payload.name || 'Development User',
        // Support both first_name/last_name and full_name
        first_name: payload.given_name || 'Development',
        last_name: payload.family_name || 'User',
        // Support both phone and phone_number
        phone: payload.phone_number || null,
        phone_number: payload.phone_number || null,
        role: Role.ADMIN, // Give admin role in development
        status: 'active',
        preferences: { theme: 'light', notifications: true },
        metadata: { isDevelopmentUser: true }
      });
      
      try {
        await this.profileRepository.save(user);
        this.logger.log('Mock user created successfully');
      } catch (error) {
        this.logger.error(`Failed to create mock user: ${error.message}`);
        // Continue even if save fails - return the unsaved entity
      }
    }

    // In production, strictly enforce user existence
    if (!user && !this.isDevelopment) {
      this.logger.error(`User with ID ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }

    // If we reach here in development mode without a user, throw an exception
    // This should never happen as we create a mock user above, but TypeScript needs this check
    if (!user) {
      this.logger.error(`Unexpected: User with ID ${userId} not found even after mock creation`);
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Gets the current user's profile information
   * Handles both old and new schema formats for compatibility
   * 
   * @param userId - The ID of the user
   * @returns The user profile with sensitive information removed
   */
  async getCurrentUser(userId: string): Promise<Partial<Profile>> {
    // In development mode, we can return a mock user to avoid database issues
    if (this.isDevelopment) {
      this.logger.warn(`Returning mock user for development with ID: ${userId}`);
      
      // Create a mock user for development without saving to database
      // Using a partial object that matches the entity structure
      const mockUser = this.profileRepository.create({
        email: 'dev@example.com',
        full_name: 'Development User',
        // Support both first_name/last_name and full_name
        first_name: 'Development',
        last_name: 'User',
        // Support both phone and phone_number
        phone: '',
        phone_number: '',
        role: Role.ADMIN,
        status: 'active',
        preferences: { theme: 'light', notifications: true },
        metadata: { isDevelopmentUser: true }
      });
      
      // Set the ID after creation
      mockUser.id = userId;
      
      // Return user without sensitive information
      const { metadata, ...userInfo } = mockUser;
      return userInfo;
    }
    
    try {
      // In production, query for the user without including relations
      // to avoid database errors if the schema doesn't match
      const user = await this.profileRepository.findOne({ 
        where: { id: userId }
      });
      
      // Handle field mapping if needed
      if (user) {
        // If full_name is missing but first_name and last_name exist, create it
        if (!user.full_name && (user.first_name || user.last_name)) {
          user.full_name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        }
        
        // If phone is missing but phone_number exists, map it
        if (!user.phone && user.phone_number) {
          user.phone = user.phone_number;
        }
        
        // Ensure preferences exists
        if (!user.preferences) {
          user.preferences = {};
        }
      }

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user without sensitive information
      const { metadata, ...userInfo } = user;
      return userInfo;
    } catch (error) {
      this.logger.error(`Error retrieving user: ${error.message}`);
      
      if (this.isDevelopment) {
        // In development, return a mock user even if database query fails
        this.logger.warn('Database error in development mode - returning mock user');
        return {
          id: userId,
          email: 'dev@example.com',
          full_name: 'Development User',
          first_name: 'Development',
          last_name: 'User',
          phone: '',
          phone_number: '',
          role: Role.ADMIN,
          status: 'active',
          preferences: { theme: 'light', notifications: true }
        };
      }
      
      throw new UnauthorizedException('Error retrieving user profile');
    }
  }

  /**
   * Validates a JWT token and returns the decoded payload
   * 
   * @param token - The JWT token to validate
   * @returns The decoded token payload
   */
  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      
      // In development mode, return a mock payload for testing
      if (this.isDevelopment) {
        this.logger.warn('Returning mock payload for development');
        return {
          sub: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Development User',
          role: Role.ADMIN
        };
      }
      
      throw new UnauthorizedException('Invalid token');
    }
  }
}
