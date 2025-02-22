import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: Repository<Payment>;
  let eventEmitter: EventEmitter2;

  const mockPayment = {
    id: '123' as string,
    order_id: '456' as string,
    amount: 100.00,
    status: PaymentStatus.PENDING,
    method: PaymentMethod.CREDIT_CARD,
    transaction_id: 'tx_123',
    provider_reference: 'ref_123',
    created_at: new Date(),
    updated_at: new Date()
  } as Payment;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    const createPaymentDto = {
      order_id: '456',
      amount: 100.00,
      method: PaymentMethod.CREDIT_CARD,
    };

    it('should create a new payment successfully', async () => {
      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.createPayment(createPaymentDto);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.created',
        expect.any(Object)
      );
    });

    it('should throw BadRequestException for invalid payment data', async () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error('Invalid data');
      });

      await expect(service.createPayment(createPaymentDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const processedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      };

      mockRepository.findOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(processedPayment);

      const result = await service.processPayment(mockPayment.id);

      expect(result).toEqual(processedPayment);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.processed',
        expect.any(Object)
      );
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.processPayment('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for already processed payment', async () => {
      const processedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      };

      mockRepository.findOne.mockResolvedValue(processedPayment);

      await expect(service.processPayment(mockPayment.id)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund payment successfully', async () => {
      const completedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      };

      const refundedPayment = {
        ...completedPayment,
        status: PaymentStatus.REFUNDED,
      };

      mockRepository.findOne.mockResolvedValue(completedPayment);
      mockRepository.save.mockResolvedValue(refundedPayment);

      const result = await service.refundPayment(mockPayment.id);

      expect(result).toEqual(refundedPayment);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.refunded',
        expect.any(Object)
      );
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.refundPayment('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for non-completed payment', async () => {
      const pendingPayment = {
        ...mockPayment,
        status: PaymentStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(pendingPayment);

      await expect(service.refundPayment(mockPayment.id)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(mockPayment.id);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
      });
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getPaymentsByOrderId', () => {
    it('should return all payments for an order', async () => {
      const payments = [mockPayment];
      mockRepository.find.mockResolvedValue(payments);

      const result = await service.getPaymentsByOrderId(mockPayment.order_id);

      expect(result).toEqual(payments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { order_id: mockPayment.order_id },
      });
    });
  });
});
