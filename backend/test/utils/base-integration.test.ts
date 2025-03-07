import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TestDbUtils } from './test-db-utils';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { TestDatabaseModule } from './test-database.module';

/**
 * Base class for integration tests
 * Provides common setup and teardown functionality for database tests
 * 
 * Extend this class for all integration tests that need database access
 */
export abstract class BaseIntegrationTest {
  protected app: INestApplication;
  protected moduleFixture: TestingModule;
  protected dataSource: DataSource;
  
  /**
   * Get module imports to use for this test
   * Override this method to add additional modules needed for your test
   * 
   * @returns Array of modules to import
   */
  protected abstract getModuleImports(): NonNullable<ModuleMetadata['imports']>;
  
  /**
   * Get module providers to use for this test
   * Override this method to add providers needed for your test
   * 
   * @returns Array of providers to register
   */
  protected abstract getModuleProviders(): NonNullable<ModuleMetadata['providers']>;
  
  /**
   * Create a testing module with the specified imports and providers
   * This will also add the TestDatabaseModule for database access
   * 
   * @returns Promise resolving to the created test module
   */
  protected async createTestingModule(): Promise<TestingModule> {
    const imports = this.getModuleImports() || [];
    const providers = this.getModuleProviders() || [];
    
    return Test.createTestingModule({
      imports: [
        // Always import the TestDatabaseModule first
        TestDatabaseModule,
        // Add test-specific imports
        ...imports,
      ],
      providers: [
        // Add test-specific providers
        ...providers,
      ],
    }).compile();
  }
  
  /**
   * Set up test environment before all tests
   * This method:
   * 1. Creates the testing module
   * 2. Creates the NestJS app
   * 3. Gets the TypeORM DataSource
   * 4. Sets up test tables
   * 5. Initializes the app
   * 
   * @returns Promise that resolves when setup is complete
   */
  async beforeAll(): Promise<void> {
    // Create testing module
    this.moduleFixture = await this.createTestingModule();
    
    // Create and initialize app
    this.app = this.moduleFixture.createNestApplication();
    await this.app.init();
    
    // Get data source
    this.dataSource = this.moduleFixture.get<DataSource>(DataSource);
    
    // Setup test tables
    await TestDbUtils.setupTestTables(this.dataSource);
  }
  
  /**
   * Clean up test environment after all tests
   * This method:
   * 1. Cleans up test tables
   * 2. Closes the NestJS app
   * 
   * @returns Promise that resolves when cleanup is complete
   */
  async afterAll(): Promise<void> {
    // Clean up test tables
    await TestDbUtils.cleanupTestTables(this.dataSource);
    
    // Close app
    await this.app.close();
  }
  
  /**
   * Reset database between tests to ensure isolation
   * 
   * @returns Promise that resolves when reset is complete
   */
  async beforeEach(): Promise<void> {
    await TestDbUtils.resetDatabase(this.dataSource);
  }
} 