import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';

describe('Store DTO Validation', () => {
  describe('CreateStoreDto', () => {
    it('should validate a valid CreateStoreDto', async () => {
      // Arrange: Create a valid DTO
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        description: 'Test Description',
        status: 'active',
        settings: { theme: 'dark' },
        metadata: { region: 'US' }
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify no validation errors
      expect(errors.length).toBe(0);
    });

    it('should fail validation when name is missing', async () => {
      // Arrange: Create DTO without name
      const dto = plainToInstance(CreateStoreDto, {
        description: 'Test Description',
        status: 'active'
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find(error => error.property === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid status', async () => {
      // Arrange: Create DTO with invalid status
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        status: 'invalid_status'
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find(error => error.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isIn');
    });

    it('should fail validation with invalid settings type', async () => {
      // Arrange: Create DTO with invalid settings type
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        status: 'active',
        settings: 'invalid_settings' // Should be an object
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const settingsError = errors.find(error => error.property === 'settings');
      expect(settingsError).toBeDefined();
      expect(settingsError?.constraints).toHaveProperty('isObject');
    });
  });

  describe('UpdateStoreDto', () => {
    it('should validate a valid partial update', async () => {
      // Arrange: Create a valid partial update DTO
      const dto = plainToInstance(UpdateStoreDto, {
        name: 'Updated Store'
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify no validation errors
      expect(errors.length).toBe(0);
    });

    it('should validate with all fields', async () => {
      // Arrange: Create a full update DTO
      const dto = plainToInstance(UpdateStoreDto, {
        name: 'Updated Store',
        description: 'Updated Description',
        status: 'inactive',
        settings: { theme: 'light' },
        metadata: { region: 'EU' }
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify no validation errors
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid status', async () => {
      // Arrange: Create update DTO with invalid status
      const dto = plainToInstance(UpdateStoreDto, {
        status: 'invalid_status'
      });

      // Act: Validate DTO
      const errors = await validate(dto);

      // Assert: Verify validation errors
      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find(error => error.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isIn');
    });
  });
});
