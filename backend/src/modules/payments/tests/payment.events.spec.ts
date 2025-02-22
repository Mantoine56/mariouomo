import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PaymentEvents', () => {
  let service: PaymentService;
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
    create: jest.fn().mockReturnValue(mockPayment),
    save: jest.fn().mockResolvedValue(mockPayment),
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
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Creation Events', () => {
    it('should emit payment.created event on successful creation', async () => {
      const createPaymentDto = {
        order_id: '456',
        amount: 100.00,
        method: PaymentMethod.CREDIT_CARD,
      };

      await service.createPayment(createPaymentDto);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.created',
        expect.objectContaining({
          payment: expect.objectContaining({
            order_id: createPaymentDto.order_id,
            amount: createPaymentDto.amount,
            method: createPaymentDto.method,
          }),
        })
      );
    });
  });

  describe('Payment Processing Events', () => {
    it('should emit payment.processed event on successful processing', async () => {
      const processedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      };

      mockRepository.findOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(processedPayment);

      await service.processPayment(mockPayment.id);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.processed',
        expect.objectContaining({
          payment: expect.objectContaining({
            id: mockPayment.id,
            status: PaymentStatus.COMPLETED,
          }),
        })
      );
    });

    it('should not emit event if processing fails', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      try {
        await service.processPayment('non-existent-id');
      } catch (error) {
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      }
    });
  });

  describe('Payment Refund Events', () => {
    it('should emit payment.refunded event on successful refund', async () => {
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

      await service.refundPayment(mockPayment.id);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.refunded',
        expect.objectContaining({
          payment: expect.objectContaining({
            id: mockPayment.id,
            status: PaymentStatus.REFUNDED,
          }),
        })
      );
    });

    it('should not emit event if refund fails', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PENDING,
      });

      try {
        await service.refundPayment(mockPayment.id);
      } catch (error) {
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      }
    });
  });

  describe('Payment Failure Events', () => {
    it('should emit payment.failed event when payment fails', async () => {
      const failedPayment = {
        ...mockPayment,
        status: PaymentStatus.FAILED,
        error_message: 'Payment declined',
      };

      mockRepository.findOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(failedPayment);

      await service.failPayment(mockPayment.id, 'Payment declined');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.failed',
        expect.objectContaining({
          payment: expect.objectContaining({
            id: mockPayment.id,
            status: PaymentStatus.FAILED,
            error_message: 'Payment declined',
          }),
        })
      );
    });
  });
});
