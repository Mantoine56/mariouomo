import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';
import { GiftCardService } from '../services/gift-card.service';
import { GiftCard, GiftCardStatus } from '../entities/gift-card.entity';
import { CreateGiftCardDto } from '../dtos/create-gift-card.dto';
import { RedeemGiftCardDto } from '../dtos/redeem-gift-card.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Profile } from '../../users/entities/profile.entity';

describe('GiftCardEvents', () => {
  let service: GiftCardService;
  let eventEmitter: EventEmitter2;
  let dataSource: DataSource;

  // Mock gift card for testing
  const mockGiftCard: GiftCard = {
    id: 'gift-card-123',
    code: 'TEST123',
    initial_balance: 100,
    current_balance: 100,
    status: GiftCardStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
    purchaser_id: undefined,
    recipient_id: undefined,
    expires_at: undefined,
    redeemed_at: undefined,
    recipient_email: undefined,
    message: undefined,
    transaction_history: undefined,
    metadata: undefined,
    purchaser: {} as Profile,
    recipient: {} as Profile
  };

  beforeEach(async () => {
    // Create mock event emitter
    const mockEventEmitter = {
      emit: jest.fn()
    };

    // Create mock repository
    const mockGiftCardRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      find: jest.fn()
    };

    // Create mock data source
    const mockDataSource = {
      transaction: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        findOne: mockGiftCardRepository.findOne,
        save: mockGiftCardRepository.save,
        create: mockGiftCardRepository.create,
        update: mockGiftCardRepository.update,
        find: mockGiftCardRepository.find
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftCardService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter
        },
        {
          provide: DataSource,
          useValue: mockDataSource
        },
        {
          provide: 'GiftCardRepository',
          useValue: mockGiftCardRepository
        }
      ],
    }).compile();

    service = module.get<GiftCardService>(GiftCardService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('Gift Card Creation Events', () => {
    it('should emit gift_card.created event on successful creation', async () => {
      // Arrange
      const createGiftCardDto: CreateGiftCardDto = {
        initial_balance: 100,
        expires_at: new Date('2025-12-31')
      };

      // Mock repository methods for successful creation
      const createdGiftCard = { ...createGiftCardDto, id: 'new-gift-card-id', code: 'GIFT123' };
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue(createdGiftCard),
          save: jest.fn().mockResolvedValue(createdGiftCard)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      const result = await service.createGiftCard(createGiftCardDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'gift_card.created',
        expect.objectContaining({
          gift_card_id: 'new-gift-card-id',
          code: 'GIFT123',
          initial_balance: createGiftCardDto.initial_balance
        })
      );
    });
  });

  describe('Gift Card Redemption Events', () => {
    it('should emit gift_card.redeemed event on successful redemption', async () => {
      // Arrange
      const redeemDto: RedeemGiftCardDto = {
        code: 'TEST123',
        amount: 50
      };

      const updatedGiftCard = {
        ...mockGiftCard,
        current_balance: mockGiftCard.current_balance - redeemDto.amount
      };

      // Mock repository methods for successful redemption
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockGiftCard),
          save: jest.fn().mockResolvedValue(updatedGiftCard)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      await service.redeemGiftCard(redeemDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'gift_card.redeemed',
        expect.objectContaining({
          gift_card_id: mockGiftCard.id,
          code: mockGiftCard.code,
          amount: redeemDto.amount,
          remaining_balance: updatedGiftCard.current_balance
        })
      );
    });

    it('should not emit event if redemption fails due to insufficient balance', async () => {
      // Arrange
      const redeemDto: RedeemGiftCardDto = {
        code: 'TEST123',
        amount: 150 // More than available balance
      };

      // Mock repository methods
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockGiftCard),
          save: jest.fn()
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act & Assert
      await expect(service.redeemGiftCard(redeemDto)).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Gift Card Cancellation Events', () => {
    it('should emit gift_card.cancelled event on successful cancellation', async () => {
      // Arrange
      const cancelledGiftCard = {
        ...mockGiftCard,
        status: GiftCardStatus.CANCELLED
      };

      // Mock repository methods
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockGiftCard),
          save: jest.fn().mockResolvedValue(cancelledGiftCard)
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      await service.cancelGiftCard('gift-card-123');

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'gift_card.cancelled',
        expect.objectContaining({
          gift_card_id: mockGiftCard.id,
          code: mockGiftCard.code,
          remaining_balance: mockGiftCard.current_balance
        })
      );
    });

    it('should not emit event if cancellation fails', async () => {
      // Arrange
      const inactiveGiftCard = {
        ...mockGiftCard,
        status: GiftCardStatus.REDEEMED
      };

      // Mock repository methods
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(inactiveGiftCard),
          save: jest.fn()
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act & Assert
      await expect(service.cancelGiftCard('gift-card-123')).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Gift Card Expiration Events', () => {
    it('should emit gift_card.expired events for expired cards', async () => {
      // Arrange
      const expiredCards = [
        { ...mockGiftCard, id: 'expired-1' },
        { ...mockGiftCard, id: 'expired-2' }
      ];

      // Mock repository methods
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue(expiredCards),
          update: jest.fn().mockResolvedValue({ affected: 2 })
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      const result = await service.processExpiredCards();

      // Assert
      expect(result).toBe(2);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expiredCards.forEach(card => {
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'gift_card.expired',
          expect.objectContaining({
            gift_card_id: card.id,
            code: card.code,
            remaining_balance: card.current_balance
          })
        );
      });
    });

    it('should not emit events if no cards are expired', async () => {
      // Mock repository methods
      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue([]),
          update: jest.fn()
        })
      } as unknown as EntityManager;

      dataSource.transaction = jest.fn().mockImplementation((cb) => cb(mockEntityManager));

      // Act
      const result = await service.processExpiredCards();

      // Assert
      expect(result).toBe(0);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
