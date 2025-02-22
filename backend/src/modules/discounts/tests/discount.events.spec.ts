import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';
import { DiscountService } from '../services/discount.service';
import { DiscountType } from '../enums/discount-type.enum';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { ValidateDiscountDto } from '../dtos/validate-discount.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DiscountEvents', () => {
  let service: DiscountService;
  let eventEmitter: EventEmitter2;
  let dataSource: DataSource;

  // Mock discount data
  const mockDiscount = {
    id: 'discount-123',
    name: 'Test Discount',
    code: 'TEST123',
    type: 'percentage' as DiscountType,
    value: 20,
    minimum_purchase: 100,
    maximum_discount: 50,
    starts_at: new Date('2025-01-01'),
    ends_at: new Date('2025-12-31'),
    times_used: 0,
    usage_limit: 1000,
    rules: {
      customer_eligibility: {
        new_customers_only: false,
        minimum_previous_orders: 0
      }
    }
  };

  beforeEach(async () => {
    // Create mock event emitter
    const mockEventEmitter = {
      emit: jest.fn()
    };

    // Create mock repository with proper TypeORM methods
    const mockDiscountRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    // Create mock data source with proper repository handling
    const mockDataSource = {
      transaction: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        findOne: mockDiscountRepository.findOne,
        save: mockDiscountRepository.save,
        create: mockDiscountRepository.create
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter
        },
        {
          provide: DataSource,
          useValue: mockDataSource
        },
        {
          provide: 'DiscountRepository',
          useValue: mockDiscountRepository
        }
      ],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('Discount Creation Events', () => {
    it('should emit discount.created event on successful creation', async () => {
      // Arrange
      const createDiscountDto: CreateDiscountDto = {
        name: 'New Discount',
        code: 'NEW2025',
        type: 'percentage' as DiscountType,
        value: 15,
        minimum_purchase: 50,
        starts_at: new Date(),
        rules: {
          customer_eligibility: {
            new_customers_only: true
          }
        }
      };

      // Mock repository methods for successful creation
      const createdDiscount = { ...createDiscountDto, id: 'new-discount-id' };
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue(createdDiscount),
          save: jest.fn().mockResolvedValue(createdDiscount)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      const result = await service.createDiscount(createDiscountDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'discount.created',
        expect.objectContaining({
          discount_id: 'new-discount-id',
          code: createDiscountDto.code,
          type: createDiscountDto.type
        })
      );
    });

    it('should not emit event if discount creation fails', async () => {
      // Arrange
      const createDiscountDto: CreateDiscountDto = {
        name: 'Duplicate Discount',
        code: 'DUPLICATE',
        type: 'percentage' as DiscountType,
        value: 15,
        starts_at: new Date()
      };

      // Mock repository methods for duplicate code scenario
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockDiscount),
          create: jest.fn(),
          save: jest.fn()
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act & Assert
      await expect(service.createDiscount(createDiscountDto)).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Discount Usage Events', () => {
    it('should emit discount.used event when usage is recorded', async () => {
      // Arrange
      const updatedDiscount = { ...mockDiscount, times_used: mockDiscount.times_used + 1 };
      
      // Mock repository methods for successful usage recording
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValueOnce(mockDiscount),
          save: jest.fn().mockResolvedValue(updatedDiscount)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      await service.recordDiscountUsage('discount-123');

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'discount.used',
        expect.objectContaining({
          discount_id: mockDiscount.id,
          code: mockDiscount.code,
          times_used: updatedDiscount.times_used
        })
      );
    });

    it('should not emit event if usage recording fails', async () => {
      // Arrange
      // Mock repository methods for non-existent discount
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValueOnce(null),
          save: jest.fn()
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act & Assert
      await expect(service.recordDiscountUsage('non-existent')).rejects.toThrow(NotFoundException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Discount Validation Events', () => {
    it('should emit discount.validated event on successful validation', async () => {
      // Arrange
      const validateDto: ValidateDiscountDto = {
        code: 'TEST123',
        cart_total: 200,
        previous_orders: 5
      };

      // Mock repository methods for successful validation
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockDiscount)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      await service.validateDiscount(validateDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'discount.validated',
        expect.objectContaining({
          discount_id: mockDiscount.id,
          code: mockDiscount.code,
          cart_total: validateDto.cart_total,
          is_valid: true
        })
      );
    });

    it('should emit discount.validation_failed when validation fails', async () => {
      // Arrange
      const validateDto: ValidateDiscountDto = {
        code: 'TEST123',
        cart_total: 50, // Below minimum_purchase
        previous_orders: 5
      };

      // Mock repository methods for validation failure
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockDiscount)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act & Assert
      await expect(service.validateDiscount(validateDto)).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'discount.validation_failed',
        expect.objectContaining({
          discount_id: mockDiscount.id,
          code: mockDiscount.code,
          cart_total: validateDto.cart_total,
          reason: expect.any(String)
        })
      );
    });
  });
});
