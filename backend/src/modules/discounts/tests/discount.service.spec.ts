import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DiscountService } from '../services/discount.service';
import { Discount } from '../entities/discount.entity';
import { DiscountType } from '../enums/discount-type.enum';

/**
 * Unit tests for the Discount Service
 * Tests discount creation, validation, and application logic
 */
describe('DiscountService', () => {
  let service: DiscountService;
  let repository: Repository<Discount>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  // Mock data
  const mockDiscount: Partial<Discount> = {
    id: 'discount-123',
    name: 'Summer Sale',
    code: 'SUMMER2025',
    type: DiscountType.PERCENTAGE,
    value: 20,
    minimum_purchase: 100,
    maximum_discount: 50,
    starts_at: new Date('2024-01-01'),  // Set to a past date
    ends_at: new Date('2026-12-31'),    // Set to a future date
    usage_limit: 1000,
    times_used: 0,
    is_active: true,
    rules: {
      customer_eligibility: {
        new_customers_only: false,
        minimum_previous_orders: 0
      }
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService,
        {
          provide: getRepositoryToken(Discount),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (
              _isolationOrCb: any,
              runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
            ) => {
              const manager = {
                getRepository: () => ({
                  create: jest.fn().mockReturnValue(mockDiscount),
                  save: jest.fn().mockResolvedValue(mockDiscount),
                  findOne: jest.fn().mockResolvedValue(null)
                })
              } as unknown as EntityManager;

              // Handle both function signatures
              const cb = runInTransaction || _isolationOrCb;
              return cb(manager);
            }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
    repository = module.get<Repository<Discount>>(getRepositoryToken(Discount));
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDiscount', () => {
    it('should create a new discount', async () => {
      // Arrange
      const createDto = {
        name: 'Summer Sale',
        code: 'SUMMER2025',
        type: DiscountType.PERCENTAGE,
        value: 20,
        starts_at: new Date()
      };

      // Act
      const result = await service.createDiscount(createDto);

      // Assert
      expect(result).toEqual(mockDiscount);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'discount.created',
        expect.objectContaining({
          discount_id: mockDiscount.id,
          code: mockDiscount.code,
          type: mockDiscount.type
        })
      );
    });

    it('should throw ConflictException if code already exists', async () => {
      // Arrange
      const createDto = {
        name: 'Summer Sale',
        code: 'SUMMER2025',
        type: DiscountType.PERCENTAGE,
        value: 20,
        starts_at: new Date()
      };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(mockDiscount),
            create: jest.fn(),
            save: jest.fn()
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act & Assert
      await expect(service.createDiscount(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateDiscount', () => {
    it('should validate an active and valid discount', async () => {
      // Arrange
      const validateDto = {
        code: 'SUMMER2025',
        cart_total: 150
      };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(mockDiscount)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act
      const result = await service.validateDiscount(validateDto);

      // Assert
      expect(result).toEqual(mockDiscount);
    });

    it('should throw NotFoundException for non-existent discount', async () => {
      // Arrange
      const validateDto = {
        code: 'INVALID',
        cart_total: 150
      };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(null)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act & Assert
      await expect(service.validateDiscount(validateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if minimum purchase not met', async () => {
      // Arrange
      const validateDto = {
        code: 'SUMMER2025',
        cart_total: 50  // Below minimum_purchase of 100
      };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(mockDiscount)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act & Assert
      await expect(service.validateDiscount(validateDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if usage limit reached', async () => {
      // Arrange
      const validateDto = {
        code: 'SUMMER2025',
        cart_total: 150
      };

      const usedDiscount = { ...mockDiscount, times_used: 1000 };  // Usage limit reached
      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(usedDiscount)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act & Assert
      await expect(service.validateDiscount(validateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should calculate percentage discount correctly', () => {
      // Arrange
      const cartTotal = 200;
      const discount = { ...mockDiscount, type: DiscountType.PERCENTAGE, value: 20 };

      // Act
      const amount = service.calculateDiscountAmount(discount as Discount, cartTotal);

      // Assert
      expect(amount).toBe(40);  // 20% of 200
    });

    it('should apply maximum discount limit', () => {
      // Arrange
      const cartTotal = 500;
      const discount = {
        ...mockDiscount,
        type: DiscountType.PERCENTAGE,
        value: 20,
        maximum_discount: 50
      };

      // Act
      const amount = service.calculateDiscountAmount(discount as Discount, cartTotal);

      // Assert
      expect(amount).toBe(50);  // Limited to maximum_discount
    });

    it('should handle fixed amount discount', () => {
      // Arrange
      const cartTotal = 200;
      const discount = { ...mockDiscount, type: DiscountType.FIXED_AMOUNT, value: 30 };

      // Act
      const amount = service.calculateDiscountAmount(discount as Discount, cartTotal);

      // Assert
      expect(amount).toBe(30);
    });
  });

  describe('recordDiscountUsage', () => {
    it('should increment usage count', async () => {
      // Arrange
      const updatedDiscount = { ...mockDiscount, times_used: 1 };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(mockDiscount),
            save: jest.fn().mockResolvedValue(updatedDiscount)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act
      const result = await service.recordDiscountUsage('discount-123');

      // Assert
      expect(result.times_used).toBe(1);
    });

    it('should throw ConflictException if usage limit reached', async () => {
      // Arrange
      const usedDiscount = { ...mockDiscount, times_used: 1000 };

      jest.spyOn(dataSource, 'transaction').mockImplementationOnce(async (
        _isolationOrCb: any,
        runInTransaction?: (entityManager: EntityManager) => Promise<unknown>
      ) => {
        const manager = {
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue(usedDiscount)
          })
        } as unknown as EntityManager;

        // Handle both function signatures
        const cb = runInTransaction || _isolationOrCb;
        return cb(manager);
      });

      // Act & Assert
      await expect(service.recordDiscountUsage('discount-123')).rejects.toThrow(ConflictException);
    });
  });
});
