import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Profile } from '../../../src/modules/users/entities/profile.entity';
import { Role } from '../../../src/modules/auth/enums/role.enum';
import { AppModule } from '../../../src/app.module';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration tests for Dashboard Authentication flows
 * 
 * These tests verify that:
 * 1. Dashboard endpoints are properly protected by authentication
 * 2. Role-based access control is correctly implemented
 * 3. Different user roles have appropriate access levels
 * 4. JWT token validation works correctly for dashboard access
 */
describe('Dashboard Authentication Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  let profileRepository: Repository<Profile>;
  let dataSource: DataSource;
  
  // Test user data
  const testUsers = {
    admin: {
      id: uuidv4(),
      email: 'admin-dashboard@example.com',
      full_name: 'Admin Dashboard User',
      role: Role.ADMIN,
    },
    merchant: {
      id: uuidv4(),
      email: 'merchant-dashboard@example.com',
      full_name: 'Merchant Dashboard User',
      role: Role.MERCHANT,
    },
    regularUser: {
      id: uuidv4(),
      email: 'user-dashboard@example.com',
      full_name: 'Regular Dashboard User',
      role: Role.USER,
    },
  };
  
  // Add interface for tokens object with index signature
  interface TokenMap {
    admin: string;
    merchant: string;
    regularUser: string;
    invalid: string;
    expired: string;
    [key: string]: string; // Add index signature to allow using string as index
  }

  // Update the tokens declaration to use the interface
  const tokens: TokenMap = {
    admin: '',
    merchant: '',
    regularUser: '',
    invalid: '',
    expired: '',
  };

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();

    // Get necessary services
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    profileRepository = moduleFixture.get<Repository<Profile>>(getRepositoryToken(Profile));
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Set up test data in the database
    await setupTestData();
    
    // Generate test tokens
    generateTestTokens();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Close the application
    await app.close();
  });

  /**
   * Set up test data in the database
   * Creates test users with different roles
   */
  async function setupTestData() {
    // Use a transaction to ensure data consistency
    await dataSource.transaction(async (manager) => {
      // Create test users
      for (const [role, userData] of Object.entries(testUsers)) {
        const user = manager.create(Profile, {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          status: 'active',
          preferences: { theme: 'light', notifications: true },
          metadata: { isTestUser: true }
        });
        
        await manager.save(user);
      }
    });
  }

  /**
   * Clean up test data from the database
   * Removes all test users created for these tests
   */
  async function cleanupTestData() {
    await dataSource.transaction(async (manager) => {
      // Delete test users
      for (const userData of Object.values(testUsers)) {
        await manager.delete(Profile, { id: userData.id });
      }
    });
  }

  /**
   * Generate JWT tokens for test users
   * Creates valid tokens for different user roles and an expired token
   */
  function generateTestTokens() {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    // Generate tokens for each test user
    for (const [role, userData] of Object.entries(testUsers)) {
      tokens[role] = jwtService.sign(
        {
          sub: userData.id,
          email: userData.email,
          name: userData.full_name,
          role: userData.role,
        },
        {
          secret: jwtSecret,
          expiresIn: '1h',
        }
      );
    }
    
    // Generate an expired token
    tokens.expired = jwtService.sign(
      {
        sub: testUsers.admin.id,
        email: testUsers.admin.email,
        name: testUsers.admin.full_name,
        role: testUsers.admin.role,
      },
      {
        secret: jwtSecret,
        expiresIn: '0s', // Expires immediately
      }
    );
  }

  /**
   * Test suite for dashboard authentication requirements
   * Verifies that dashboard endpoints require authentication
   * 
   * Note: These tests may fail initially if the dashboard controller
   * doesn't have authentication guards applied. They should pass after
   * implementing the necessary guards.
   */
  describe('Dashboard Authentication Requirements', () => {
    it('should reject dashboard requests without authentication token', async () => {
      // Test the dashboard overview endpoint
      const response = await request(app.getHttpServer())
        .get('/dashboard');
      
      // Expect 401 Unauthorized
      // Note: This will fail if the dashboard controller doesn't have auth guards
      expect(response.status).toBe(401);
    });

    it('should reject dashboard requests with invalid token format', async () => {
      // Test with an invalid token format
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${tokens.invalid}`);
      
      // Expect 401 Unauthorized
      // Note: This will fail if the dashboard controller doesn't have auth guards
      expect(response.status).toBe(401);
    });

    it('should reject dashboard requests with expired token', async () => {
      // Wait a moment to ensure the token is expired
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test with an expired token
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${tokens.expired}`);
      
      // Expect 401 Unauthorized
      // Note: This will fail if the dashboard controller doesn't have auth guards
      expect(response.status).toBe(401);
    });
  });

  /**
   * Test suite for dashboard role-based access control
   * Verifies that dashboard endpoints enforce proper role requirements
   */
  describe('Dashboard Role-Based Access Control', () => {
    it('should allow admin users to access dashboard endpoints', async () => {
      // Test the dashboard endpoint with admin token
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${tokens.admin}`);
      
      // Expect 200 OK if auth guards are implemented and admin has access
      // Note: This will fail if the dashboard controller doesn't have auth guards
      // or if admins don't have access
      expect(response.status).toBe(200);
    });

    it('should allow merchant users to access dashboard endpoints', async () => {
      // Test the dashboard endpoint with merchant token
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${tokens.merchant}`);
      
      // Expect 200 OK if auth guards are implemented and merchants have access
      // Note: This will fail if merchants don't have access
      expect(response.status).toBe(200);
    });

    it('should reject regular users from accessing dashboard endpoints', async () => {
      // Test the dashboard endpoint with regular user token
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${tokens.regularUser}`);
      
      // Expect 403 Forbidden if auth guards are implemented
      // Note: This will fail if the dashboard controller doesn't have auth guards
      // or if regular users have access
      expect(response.status).toBe(403);
    });
  });
});
