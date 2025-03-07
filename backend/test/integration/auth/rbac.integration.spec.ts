import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../../src/modules/users/entities/profile.entity';
import { Role } from '../../../src/modules/auth/enums/role.enum';
import { AuthTestModule } from '../../utils/auth-test.module';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration tests for Role-Based Access Control
 * 
 * These tests verify that:
 * 1. Role restrictions are properly enforced across different modules
 * 2. Different user roles have appropriate access to endpoints
 * 3. Access controls correctly restrict unauthorized access
 * 4. Public endpoints are accessible without authentication
 */
describe('Role-Based Access Control Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  
  // Test user data
  const testUsers = {
    admin: {
      id: uuidv4(),
      email: 'admin-rbac-test@example.com',
      full_name: 'Admin RBAC Test User',
      role: Role.ADMIN,
    },
    superAdmin: {
      id: uuidv4(),
      email: 'super-admin-rbac-test@example.com',
      full_name: 'Super Admin RBAC Test User',
      role: Role.SUPER_ADMIN,
    },
    merchant: {
      id: uuidv4(),
      email: 'merchant-rbac-test@example.com',
      full_name: 'Merchant RBAC Test User',
      role: Role.MERCHANT,
    },
    regularUser: {
      id: uuidv4(),
      email: 'user-rbac-test@example.com',
      full_name: 'Regular RBAC Test User',
      role: Role.USER,
    },
  };
  
  // Token storage
  const tokens: Record<string, string> = {
    admin: '',
    superAdmin: '',
    merchant: '',
    regularUser: '',
  };

  beforeAll(async () => {
    // Create the testing module with mocked dependencies
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();

    // Get necessary services
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Generate test tokens
    generateTestTokens();
  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    // Close the application
    await app.close();
  });

  /**
   * Generate JWT tokens for test users
   * Creates valid tokens for different user roles
   */
  function generateTestTokens() {
    const jwtSecret = configService.get<string>('JWT_SECRET') || 
                     configService.get<string>('SUPABASE_JWT_SECRET') || 
                     'test_jwt_secret_for_integration_tests';
    
    // Generate tokens for each test user
    for (const [role, userData] of Object.entries(testUsers)) {
      tokens[role as keyof typeof tokens] = jwtService.sign(
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
  }

  /**
   * Test suite for public endpoints
   * Verifies that endpoints marked as public are accessible without authentication
   */
  describe('Public Endpoints', () => {
    it('should allow access to health check endpoint without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');
      
      expect(response.status).toBe(200);
    });

    it('should allow access to auth status endpoint without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/status');
      
      expect(response.status).toBe(200);
    });
  });

  /**
   * Test suite for admin-only endpoints
   * Verifies that endpoints restricted to admins enforce proper access control
   */
  describe('Admin-Only Endpoints', () => {
    it('should allow admin to access admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${tokens.admin}`);
      
      expect(response.status).toBe(200);
    });

    it('should allow super-admin to access admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${tokens.superAdmin}`);
      
      expect(response.status).toBe(200);
    });

    it('should deny merchant access to admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${tokens.merchant}`);
      
      expect(response.status).toBe(403);
    });

    it('should deny regular user access to admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${tokens.regularUser}`);
      
      expect(response.status).toBe(403);
    });

    it('should deny anonymous access to admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin');
      
      expect(response.status).toBe(401);
    });
  });

  /**
   * Test suite for role verification across different modules
   * Verifies that role-based access control works across different parts of the application
   */
  describe('Cross-Module Role Verification', () => {
    // Test analytics endpoints (admin-only)
    describe('Analytics Module', () => {
      it('should allow admin to access analytics endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/analytics/traffic-sources')
          .query({ startDate: '2023-01-01', endDate: '2023-01-31' })
          .set('Authorization', `Bearer ${tokens.admin}`);
        
        // In test environment, this might still fail with 404 or 500 if there's no real data,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([200, 404, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should deny merchant access to admin-only analytics endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/analytics/traffic-sources')
          .query({ startDate: '2023-01-01', endDate: '2023-01-31' })
          .set('Authorization', `Bearer ${tokens.merchant}`);
        
        expect(response.status).toBe(403);
      });

      it('should deny regular user access to admin-only analytics endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/analytics/traffic-sources')
          .query({ startDate: '2023-01-01', endDate: '2023-01-31' })
          .set('Authorization', `Bearer ${tokens.regularUser}`);
        
        expect(response.status).toBe(403);
      });
    });

    // Test inventory endpoints (admin-only)
    describe('Inventory Module', () => {
      it('should allow admin to access inventory endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/inventory/items')
          .set('Authorization', `Bearer ${tokens.admin}`);
        
        // In test environment, this might still fail with 404 or 500 if there's no real data,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([200, 404, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should deny merchant access to admin-only inventory endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/inventory/items')
          .set('Authorization', `Bearer ${tokens.merchant}`);
        
        expect(response.status).toBe(403);
      });

      it('should deny regular user access to admin-only inventory endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/inventory/items')
          .set('Authorization', `Bearer ${tokens.regularUser}`);
        
        expect(response.status).toBe(403);
      });
    });

    // Test dashboard endpoints (admin and merchant)
    describe('Dashboard Module', () => {
      it('should allow admin to access dashboard endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/dashboard')
          .set('Authorization', `Bearer ${tokens.admin}`);
        
        // In test environment, this might still fail with 404 or 500 if there's no real data,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([200, 404, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should allow merchant to access dashboard endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/dashboard')
          .set('Authorization', `Bearer ${tokens.merchant}`);
        
        // In test environment, this might still fail with 404 or 500 if there's no real data,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([200, 404, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should deny regular user access to dashboard endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/dashboard')
          .set('Authorization', `Bearer ${tokens.regularUser}`);
        
        expect(response.status).toBe(403);
      });
    });

    // Test product management endpoints (admin-only)
    describe('Product Management Module', () => {
      it('should allow admin to access product creation endpoints', async () => {
        const response = await request(app.getHttpServer())
          .post('/products')
          .send({ name: 'Test Product', base_price: 99.99, type: 'physical', store_id: uuidv4() })
          .set('Authorization', `Bearer ${tokens.admin}`);
        
        // In test environment, this might still fail with 400 (validation error) or 500,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([201, 400, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should deny regular user access to product creation endpoints', async () => {
        const response = await request(app.getHttpServer())
          .post('/products')
          .send({ name: 'Test Product', base_price: 99.99, type: 'physical', store_id: uuidv4() })
          .set('Authorization', `Bearer ${tokens.regularUser}`);
        
        expect(response.status).toBe(403);
      });
    });

    // Test product variant endpoints (admin and merchant)
    describe('Product Variant Module', () => {
      it('should allow merchant to access variant endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/variants')
          .set('Authorization', `Bearer ${tokens.merchant}`);
        
        // In test environment, this might still fail with 404 or 500 if there's no real data,
        // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
        expect([200, 404, 500]).toContain(response.status);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('should deny regular user access to variant endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/variants')
          .set('Authorization', `Bearer ${tokens.regularUser}`);
        
        expect(response.status).toBe(403);
      });
    });
  });

  /**
   * Test suite for user profile access
   * Verifies that users can access their own profiles and admins can access all profiles
   */
  describe('User Profile Access', () => {
    it('should allow admin to access all user profiles', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profiles')
        .set('Authorization', `Bearer ${tokens.admin}`);
      
      // In test environment, this might still fail with 404 or 500 if there's no real data,
      // but it shouldn't return 401 (unauthorized) or 403 (forbidden)
      expect([200, 404, 500]).toContain(response.status);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should allow all users to access their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${tokens.regularUser}`);
      
      // The profile endpoint should be accessible by any authenticated user
      expect([200, 500]).toContain(response.status);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });
}); 