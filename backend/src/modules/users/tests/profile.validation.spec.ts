import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProfileDto, UserStatus } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { Role } from '../../auth/enums/role.enum';

/**
 * Test suite for profile DTOs validation
 */
describe('Profile DTO Validation', () => {
  describe('CreateProfileDto', () => {
    it('should validate a valid create profile dto', async () => {
      // Arrange
      const dto = plainToInstance(CreateProfileDto, {
        full_name: 'John Doe',
        email: 'john@example.com',
        role: Role.USER,
        status: UserStatus.ACTIVE
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when full_name is missing', async () => {
      // Arrange
      const dto = plainToInstance(CreateProfileDto, {
        email: 'john@example.com',
        role: Role.USER
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('full_name');
    });

    it('should fail validation when email is invalid', async () => {
      // Arrange
      const dto = plainToInstance(CreateProfileDto, {
        full_name: 'John Doe',
        email: 'invalid-email',
        role: Role.USER
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation when role is invalid', async () => {
      // Arrange
      const dto = plainToInstance(CreateProfileDto, {
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'invalid-role'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should use default values when optional fields are not provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateProfileDto, {
        full_name: 'John Doe',
        email: 'john@example.com'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
      expect(dto.role).toBe(Role.USER);
      expect(dto.status).toBe(UserStatus.ACTIVE);
    });
  });

  describe('UpdateProfileDto', () => {
    it('should validate a valid update profile dto', async () => {
      // Arrange
      const dto = plainToInstance(UpdateProfileDto, {
        full_name: 'Updated Name'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should validate when all fields are provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateProfileDto, {
        full_name: 'Updated Name',
        email: 'updated@example.com',
        role: Role.ADMIN,
        status: UserStatus.INACTIVE
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when email is invalid', async () => {
      // Arrange
      const dto = plainToInstance(UpdateProfileDto, {
        email: 'invalid-email'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation when role is invalid', async () => {
      // Arrange
      const dto = plainToInstance(UpdateProfileDto, {
        role: 'invalid-role'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should fail validation when status is invalid', async () => {
      // Arrange
      const dto = plainToInstance(UpdateProfileDto, {
        status: 'invalid-status'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
    });
  });
});
