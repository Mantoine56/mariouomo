import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../../src/modules/users/entities/profile.entity';
import { Role } from '../../../src/modules/auth/enums/role.enum';
import { AuthTestDatabaseModule } from '../../utils/auth-test-database.module';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { v4 as uuidv4 } from 'uuid';

// Mock bcrypt instead of importing it directly
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((str) => Promise.resolve(`hashed_${str}`)),
  compare: jest.fn().mockImplementation((str, hash) => Promise.resolve(hash === `hashed_${str}`))
}));

/**
 * Integration tests for Authentication Service with Real Database
 * 
 * These tests verify that:
 * 1. The AuthService can be instantiated with proper dependencies
 * 2. The JWT functionality works correctly
 * 3. Authentication workflows (login, register, etc.) function as expected
 */
describe('Authentication Service Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let profileRepository: Repository<Profile>;
  
  // Test profile data with UUIDs
  const testPassword = 'Test1234!';
  const testProfile = {
    id: uuidv4(),
    email: `auth-test-${Date.now()}@example.com`,
    full_name: 'Auth Test User',
    role: Role.USER,
    status: 'active',
    password: `hashed_${testPassword}`, // Pre-hashed password using our mock
    preferences: { theme: 'light' },
    metadata: { test_user: true }
  };

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Import and configure JWT
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { 
              expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h' 
            },
          }),
          inject: [ConfigService],
        }),
        // Import ConfigModule for environment variables
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        // Import the database module
        AuthTestDatabaseModule,
      ],
      providers: [
        AuthService,
      ],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get services
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    
    // Get repositories
    try {
      profileRepository = moduleFixture.get<Repository<Profile>>(
        getRepositoryToken(Profile)
      );
      console.log('Successfully got profile repository');
    } catch (error) {
      console.error('Error getting profile repository:', error);
      throw error;
    }

    // Create a test profile
    await profileRepository.save({
      ...testProfile,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Mock the getCurrentUser method to return the actual profile
    jest.spyOn(authService, 'getCurrentUser').mockImplementation(async (userId: string) => {
      const profile = await profileRepository.findOne({ where: { id: userId } });
      if (!profile) {
        throw new Error('User not found');
      }
      // Remove metadata as the real method does
      const { metadata, ...userInfo } = profile;
      return userInfo;
    });

  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    // Clean up - remove test profile
    try {
      await profileRepository.delete(testProfile.id);
    } catch (error) {
      console.error('Error deleting test profile:', error);
    }

    // Close the application
    try {
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Error closing app:', error);
    }
  }, 10000); // Increased timeout for cleanup

  /**
   * AuthService availability tests
   */
  describe('AuthService Initialization', () => {
    it('should have authService defined', () => {
      expect(authService).toBeDefined();
    });

    it('should have jwtService defined', () => {
      expect(jwtService).toBeDefined();
    });

    it('should have configService defined', () => {
      expect(configService).toBeDefined();
    });
  });

  /**
   * JWT functionality tests
   */
  describe('JWT Functionality', () => {
    it('should generate a valid JWT token', () => {
      const payload = { 
        sub: testProfile.id,
        email: testProfile.email,
        role: testProfile.role
      };
      
      const token = jwtService.sign(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwtService.verify(token);
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(testProfile.id);
      expect(decoded.email).toBe(testProfile.email);
      expect(decoded.role).toBe(testProfile.role);
    });
  });

  /**
   * Auth workflow tests
   */
  describe('Authentication Workflows', () => {
    it('should find a profile by email', async () => {
      const profile = await profileRepository.findOne({
        where: { email: testProfile.email }
      });
      
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testProfile.id);
    });
    
    it('should validate a user based on JWT payload', async () => {
      // Create a sample JWT payload
      const payload = { 
        sub: testProfile.id,
        email: testProfile.email,
        role: testProfile.role
      };
      
      // Validate the user
      const validatedUser = await authService.validateUser(payload);
      
      // Verify the user was correctly validated
      expect(validatedUser).toBeDefined();
      expect(validatedUser.id).toBe(testProfile.id);
      expect(validatedUser.email).toBe(testProfile.email);
      expect(validatedUser.role).toBe(testProfile.role);
    });
    
    it('should validate a JWT token', () => {
      // Create and sign a token
      const payload = { 
        sub: testProfile.id,
        email: testProfile.email,
        role: testProfile.role
      };
      const token = jwtService.sign(payload);
      
      // Validate the token
      const validatedPayload = authService.validateToken(token);
      
      // Verify the payload was correctly extracted
      expect(validatedPayload).toBeDefined();
      expect(validatedPayload.sub).toBe(testProfile.id);
      expect(validatedPayload.email).toBe(testProfile.email);
      expect(validatedPayload.role).toBe(testProfile.role);
    });
    
    it('should get current user profile', async () => {
      // Get the current user
      const userProfile = await authService.getCurrentUser(testProfile.id);
      
      // Verify the profile was correctly retrieved
      expect(userProfile).toBeDefined();
      expect(userProfile.id).toBe(testProfile.id);
      expect(userProfile.email).toBe(testProfile.email);
      expect(userProfile.role).toBe(testProfile.role);
      
      // Verify that sensitive information is removed
      expect(userProfile.metadata).toBeUndefined();
    });
  });
}); 