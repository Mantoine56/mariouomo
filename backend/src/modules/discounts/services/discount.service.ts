import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Discount, DiscountType } from '../entities/discount.entity';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { UpdateDiscountDto } from '../dtos/update-discount.dto';
import { ValidateDiscountDto } from '../dtos/validate-discount.dto';

/**
 * Service handling discount-related business logic
 * Manages discount creation, validation, and application
 */
@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new discount
   * @param dto Discount creation data
   * @returns Created discount
   */
  async createDiscount(dto: CreateDiscountDto): Promise<Discount> {
    return await this.dataSource.transaction(async manager => {
      // Check for existing discount code
      const existing = await manager.getRepository(Discount).findOne({
        where: { code: dto.code }
      });

      if (existing) {
        throw new ConflictException('Discount code already exists');
      }

      const discount = manager.getRepository(Discount).create(dto);
      const savedDiscount = await manager.getRepository(Discount).save(discount);

      this.eventEmitter.emit('discount.created', {
        discount_id: savedDiscount.id,
        code: savedDiscount.code,
        type: savedDiscount.type
      });

      return savedDiscount;
    });
  }

  /**
   * Updates an existing discount
   * @param id Discount ID
   * @param dto Update data
   * @returns Updated discount
   */
  async updateDiscount(id: string, dto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id }
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    // Check code uniqueness if being updated
    if (dto.code && dto.code !== discount.code) {
      const existing = await this.discountRepository.findOne({
        where: { code: dto.code }
      });

      if (existing) {
        throw new ConflictException('Discount code already exists');
      }
    }

    Object.assign(discount, dto);
    const savedDiscount = await this.discountRepository.save(discount);

    this.eventEmitter.emit('discount.updated', {
      discount_id: savedDiscount.id,
      code: savedDiscount.code,
      changes: Object.keys(dto)
    });

    return savedDiscount;
  }

  /**
   * Validates a discount code for application
   * @param dto Validation data including code and cart info
   * @returns Valid discount or throws error
   */
  async validateDiscount(dto: ValidateDiscountDto): Promise<Discount> {
    return await this.dataSource.transaction(async manager => {
      const discount = await manager.getRepository(Discount).findOne({
        where: { 
          code: dto.code,
          is_active: true
        }
      });

      try {
        if (!discount) {
          throw new NotFoundException('Discount not found or inactive');
        }

        // Check temporal validity
        const now = new Date();
        if (discount.starts_at > now || (discount.ends_at && discount.ends_at < now)) {
          throw new ConflictException('Discount is not currently valid');
        }

        // Check usage limit
        if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
          throw new ConflictException('Discount usage limit reached');
        }

        // Check minimum purchase
        if (discount.minimum_purchase && dto.cart_total < discount.minimum_purchase) {
          throw new ConflictException(`Minimum purchase amount of ${discount.minimum_purchase} required`);
        }

        // Check customer eligibility rules
        if (discount.rules?.customer_eligibility) {
          const customer_eligibility = discount.rules.customer_eligibility;

          // Check if new customers only
          if (customer_eligibility.new_customers_only && (dto.previous_orders ?? 0) > 0) {
            throw new ConflictException('This discount is only valid for new customers');
          }

          // Check minimum previous orders
          if (customer_eligibility.minimum_previous_orders &&
              (dto.previous_orders ?? 0) < customer_eligibility.minimum_previous_orders) {
            throw new ConflictException('You do not meet the minimum previous orders requirement');
          }

          // Check customer group eligibility
          const customerGroups = customer_eligibility.specific_customer_groups;
          if (customerGroups && customerGroups.length > 0) {
            const userGroups = dto.customer_groups ?? [];
            if (!customerGroups.some(group => userGroups.includes(group))) {
              throw new ConflictException('You are not eligible for this discount');
            }
          }
        }

        this.eventEmitter.emit('discount.validated', {
          discount_id: discount.id,
          code: discount.code,
          cart_total: dto.cart_total,
          is_valid: true
        });

        return discount;
      } catch (error) {
        if (error instanceof ConflictException) {
          this.eventEmitter.emit('discount.validation_failed', {
            discount_id: discount?.id,
            code: dto.code,
            cart_total: dto.cart_total,
            reason: error.message
          });
        }
        throw error;
      }
    });
  }

  /**
   * Calculates the discount amount
   * @param discount Discount to apply
   * @param cartTotal Total cart amount
   * @returns Calculated discount amount
   */
  calculateDiscountAmount(discount: Discount, cartTotal: number): number {
    let amount = 0;

    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        amount = (cartTotal * discount.value) / 100;
        break;
      
      case DiscountType.FIXED_AMOUNT:
        amount = discount.value;
        break;
      
      case DiscountType.FREE_SHIPPING:
        // Handled separately by shipping service
        amount = 0;
        break;
      
      case DiscountType.BUY_X_GET_Y:
        // Complex calculation handled by separate method
        amount = 0;
        break;
    }

    // Apply maximum discount if set
    if (discount.maximum_discount) {
      amount = Math.min(amount, discount.maximum_discount);
    }

    return amount;
  }

  /**
   * Records usage of a discount
   * @param id Discount ID
   * @returns Updated discount
   */
  async recordDiscountUsage(id: string): Promise<Discount> {
    return await this.dataSource.transaction(async manager => {
      const discountRepo = manager.getRepository(Discount);
      const discount = await discountRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!discount) {
        throw new NotFoundException('Discount not found');
      }

      if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
        throw new ConflictException('Discount usage limit reached');
      }

      // Update usage count
      discount.times_used += 1;
      const updatedDiscount = await discountRepo.save(discount);

      // Emit discount used event
      this.eventEmitter.emit('discount.used', {
        discount_id: updatedDiscount.id,
        code: updatedDiscount.code,
        times_used: updatedDiscount.times_used
      });

      return updatedDiscount;
    });
  }
}
