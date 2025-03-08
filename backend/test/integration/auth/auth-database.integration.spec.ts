import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../../src/modules/users/entities/profile.entity';
import { Role } from '../../../src/modules/auth/enums/role.enum';
import { AuthTestDatabaseModule } from '../../utils/auth-test-database.module';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration tests for Database Connectivity
 * 
 * These tests verify that:
 * 1. We can connect to the database
 * 2. We can access the Profile repository
 * 3. We can create and retrieve profiles in the database
 */
describe('Database Connectivity Tests', () => {
  let app: INestApplication;
  let profileRepository: Repository<Profile>;
  
  // Test profile data with UUIDs
  const testProfile = {
    id: uuidv4(),
    email: `test-db-connectivity-${Date.now()}@example.com`,
    full_name: 'Test DB Connectivity User',
    role: Role.USER,
    status: 'active',
    preferences: { theme: 'light' },
    metadata: { test_user: true }
  };

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthTestDatabaseModule,
      ],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();
    
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

  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    // Clean up
    try {
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Error closing app:', error);
    }
  }, 10000); // Increased timeout for cleanup

  /**
   * Basic database connectivity test
   */
  describe('Database Connection', () => {
    it('should have a valid profile repository', () => {
      expect(profileRepository).toBeDefined();
    });

    it('should be able to create a profile in the database', async () => {
      // Create a profile
      const createdProfile = await profileRepository.save({
        ...testProfile,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      expect(createdProfile).toBeDefined();
      expect(createdProfile.id).toBe(testProfile.id);
      expect(createdProfile.email).toBe(testProfile.email);
    });

    it('should be able to retrieve a profile from the database', async () => {
      // Find the profile
      const foundProfile = await profileRepository.findOne({
        where: { id: testProfile.id }
      });
      
      expect(foundProfile).toBeDefined();
      expect(foundProfile?.email).toBe(testProfile.email);
      expect(foundProfile?.role).toBe(testProfile.role);
    });

    it('should be able to delete a profile from the database', async () => {
      // Delete the profile
      await profileRepository.delete(testProfile.id);
      
      // Verify it's deleted
      const foundProfile = await profileRepository.findOne({
        where: { id: testProfile.id }
      });
      
      expect(foundProfile).toBeNull();
    });
  });
}); 