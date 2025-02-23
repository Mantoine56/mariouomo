import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum for user roles
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

/**
 * Enum for user status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

/**
 * DTO for creating a new user profile
 */
export class CreateProfileDto {
  @ApiProperty({ description: 'User\'s full name' })
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'User\'s email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User\'s role', enum: UserRole, default: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;

  @ApiProperty({ description: 'User\'s status', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus = UserStatus.ACTIVE;
}
