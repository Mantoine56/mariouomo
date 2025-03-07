import { Module, Controller, Get, Post, UseGuards, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Profile } from '../../src/modules/users/entities/profile.entity';
import { SupabaseJwtStrategy } from '../../src/modules/auth/strategies/supabase-jwt.strategy';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { AuthController } from '../../src/modules/auth/controllers/auth.controller';
import { TestDatabaseModule } from './test-database.module';
import { Repository } from 'typeorm';
import { Public } from '../../src/modules/auth/decorators/public.decorator';
import { Roles } from '../../src/modules/auth/decorators/roles.decorator';
import { Role } from '../../src/modules/auth/enums/role.enum';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';

// Custom Auth Service for testing
class TestAuthService extends AuthService {
  constructor(
    jwtService: JwtService,
    configService: ConfigService,
    profileRepository: Repository<Profile>,
  ) {
    super(jwtService, configService, profileRepository);
  }

  // Override getCurrentUser to return a mock user in tests
  // This avoids the error "Cannot set properties of undefined (setting 'id')"
  async getCurrentUser(userId: string): Promise<Partial<Profile>> {
    // For testing purposes, always return a mock user based on the userId
    return {
      id: userId,
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'admin',
      status: 'active',
      preferences: { theme: 'light' },
    };
  }
}

/**
 * Mock Controllers for RBAC testing
 * These controllers provide test endpoints with different role restrictions
 */

// Mock Auth Controller with admin-only and public endpoints
@Controller('auth')
export class TestAuthController {
  @Public()
  @Get('status')
  getAuthStatus() {
    return { status: 'ok', authenticated: false };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return { message: 'Profile access successful' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  adminAccess() {
    return { message: 'Admin access successful' };
  }
}

// Mock Analytics Controller with admin-only endpoints
@Controller('analytics')
export class TestAnalyticsController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('traffic-sources')
  getTrafficSources() {
    return { sources: ['direct', 'organic', 'referral'] };
  }
}

// Mock Inventory Controller with admin-only endpoints
@Controller('inventory')
export class TestInventoryController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('items')
  getInventoryItems() {
    return { items: [] };
  }
}

// Mock Dashboard Controller with admin and merchant access
@Controller('dashboard')
export class TestDashboardController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MERCHANT)
  @Get()
  getDashboard() {
    return { stats: {} };
  }
}

// Mock Products Controller with different role requirements
@Controller('products')
export class TestProductsController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  createProduct() {
    return { id: '123', name: 'Test Product' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MERCHANT)
  @Get('variants')
  getVariants() {
    return { variants: [] };
  }
}

// Mock Users Controller for profile access
@Controller('users')
export class TestUsersController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('profiles')
  getAllProfiles() {
    return { profiles: [] };
  }
}

// Health check controller
@Controller()
export class TestHealthController {
  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}

/**
 * Test module for Authentication
 * Provides isolated dependencies for testing auth functionality
 */
@Module({
  imports: [
    TestDatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    // Import TypeORM module for Profile entity
    TypeOrmModule.forFeature([Profile]),
    
    // Configure Passport with JWT as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Configure JWT module with dynamic secret retrieval
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Use a fixed test secret for consistent test behavior
        const jwtSecret = 'test_jwt_secret_for_authentication_tests';
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  controllers: [
    // Original auth controller
    AuthController,
    
    // Mock controllers for RBAC testing
    TestAuthController,
    TestAnalyticsController,
    TestInventoryController, 
    TestDashboardController,
    TestProductsController,
    TestUsersController,
    TestHealthController
  ],
  providers: [
    // Use the test auth service implementation
    {
      provide: AuthService,
      useClass: TestAuthService,
    },
    
    // JWT strategy for authentication
    SupabaseJwtStrategy,
    
    // Guards for RBAC testing
    JwtAuthGuard,
    RolesGuard,
    
    // Mock profile repository
    {
      provide: getRepositoryToken(Profile),
      useValue: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      },
    },
  ],
  exports: [JwtModule, AuthService, SupabaseJwtStrategy, JwtAuthGuard, RolesGuard],
})
export class AuthTestModule {} 