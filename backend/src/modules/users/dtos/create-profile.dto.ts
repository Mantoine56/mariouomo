import { IsString, IsEmail, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

/**
 * Enum for user status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// For backward compatibility, we're using Role from auth module
export type UserRole = Role;

/**
 * DTO for creating a new user profile
 * Includes both new and legacy fields for compatibility during migration
 */
export class CreateProfileDto {
  @ApiProperty({ description: 'User\'s full name' })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({ description: 'User\'s first name (legacy field)' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ description: 'User\'s last name (legacy field)' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ description: 'User\'s email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User\'s phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User\'s phone number (legacy field)' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ description: 'User\'s role', enum: Role, default: Role.USER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;

  @ApiProperty({ description: 'User\'s status', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus = UserStatus.ACTIVE;

  @ApiProperty({ description: 'User preferences in JSON format' })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata in JSON format' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
