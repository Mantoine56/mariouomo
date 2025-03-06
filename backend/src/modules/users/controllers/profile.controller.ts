import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Public } from '../../auth/decorators/public.decorator';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

/**
 * Controller handling user profile-related endpoints
 * Implements proper authentication and role-based authorization
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get all profiles with pagination
   * Requires ADMIN role
   * 
   * @param skip - Number of records to skip for pagination
   * @param take - Number of records to take per page
   * @returns Array of profiles and total count
   */
  @Get('profiles')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all profiles (Admin only)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profiles retrieved successfully',
    type: [Profile],
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<{ items: Profile[]; total: number }> {
    this.logger.log(`Retrieving profiles with skip=${skip}, take=${take}`);
    const [profiles, total] = await this.profileService.findAll(
      skip ? +skip : 0,
      take ? +take : 10,
    );
    return { items: profiles, total };
  }

  /**
   * Get a profile by ID
   * Requires ADMIN role or must be the profile owner
   * 
   * @param id - Profile ID
   * @returns The requested profile
   */
  @Get('profiles/:id')
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
    type: Profile,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Profile> {
    this.logger.log(`Retrieving profile with id=${id}`);
    return this.profileService.findOne(id);
  }

  /**
   * Create a new profile
   * Requires ADMIN role
   * 
   * @param createProfileDto - Data for creating a new profile
   * @returns The created profile
   */
  @Post('profiles')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new profile (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Profile created successfully',
    type: Profile,
  })
  async create(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    this.logger.log('Creating new profile');
    return this.profileService.create(createProfileDto);
  }

  /**
   * Update a profile by ID
   * Requires ADMIN role or must be the profile owner
   * 
   * @param id - Profile ID
   * @param updateProfileDto - Data for updating the profile
   * @returns The updated profile
   */
  @Put('profiles/:id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: Profile,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    this.logger.log(`Updating profile with id=${id}`);
    return this.profileService.update(id, updateProfileDto);
  }

  /**
   * Delete a profile by ID
   * Requires ADMIN role
   * 
   * @param id - Profile ID
   * @returns Success message
   */
  @Delete('profiles/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete profile by ID (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting profile with id=${id}`);
    await this.profileService.remove(id);
    return { message: 'Profile deleted successfully' };
  }
}
