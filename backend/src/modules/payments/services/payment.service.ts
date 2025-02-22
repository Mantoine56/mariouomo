import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

/**
 * Service responsible for handling payment operations
 */
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new payment
   * @param createPaymentDto Payment creation data
   * @returns Created payment
   */
  async createPayment(createPaymentDto: {
    order_id: string;
    amount: number;
    method: PaymentMethod;
  }): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      this.eventEmitter.emit('payment.created', { payment: savedPayment });

      return savedPayment;
    } catch (error) {
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * Processes a pending payment
   * @param paymentId ID of the payment to process
   * @returns Processed payment
   */
  async processPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment cannot be processed');
    }

    payment.status = PaymentStatus.COMPLETED;
    const processedPayment = await this.paymentRepository.save(payment);

    this.eventEmitter.emit('payment.processed', { payment: processedPayment });

    return processedPayment;
  }

  /**
   * Refunds a completed payment
   * @param paymentId ID of the payment to refund
   * @returns Refunded payment
   */
  async refundPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    payment.status = PaymentStatus.REFUNDED;
    const refundedPayment = await this.paymentRepository.save(payment);

    this.eventEmitter.emit('payment.refunded', { payment: refundedPayment });

    return refundedPayment;
  }

  /**
   * Marks a payment as failed
   * @param paymentId ID of the payment
   * @param errorMessage Error message explaining the failure
   * @returns Failed payment
   */
  async failPayment(paymentId: string, errorMessage: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.FAILED;
    payment.error_message = errorMessage;
    const failedPayment = await this.paymentRepository.save(payment);

    this.eventEmitter.emit('payment.failed', { payment: failedPayment });

    return failedPayment;
  }

  /**
   * Retrieves a payment by ID
   * @param paymentId ID of the payment
   * @returns Payment details
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Retrieves all payments for an order
   * @param orderId ID of the order
   * @returns List of payments
   */
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { order_id: orderId },
    });
  }
}
