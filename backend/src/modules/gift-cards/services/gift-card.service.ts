import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GiftCard, GiftCardStatus } from '../entities/gift-card.entity';
import { CreateGiftCardDto } from '../dtos/create-gift-card.dto';
import { RedeemGiftCardDto } from '../dtos/redeem-gift-card.dto';
import { generateUniqueCode } from '../../../common/utils/code-generator';

/**
 * Service handling gift card operations
 * Manages creation, redemption, and balance tracking
 */
@Injectable()
export class GiftCardService {
  constructor(
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new gift card
   * @param dto Gift card creation data
   * @returns Created gift card
   */
  async createGiftCard(dto: CreateGiftCardDto): Promise<GiftCard> {
    return await this.dataSource.transaction(async manager => {
      const giftCardRepo = manager.getRepository(GiftCard);

      // Generate unique code
      const code = await generateUniqueCode(8);
      const existingCard = await giftCardRepo.findOne({ where: { code } });
      if (existingCard) {
        throw new ConflictException('Gift card code already exists');
      }

      // Create new gift card
      const giftCard = giftCardRepo.create({
        ...dto,
        code,
        current_balance: dto.initial_balance,
        status: GiftCardStatus.ACTIVE,
        purchaser_id: dto.purchaser_id?.toString(),
        recipient_id: dto.recipient_id?.toString()
      });

      const savedCard = await giftCardRepo.save(giftCard);

      // Emit gift card created event
      this.eventEmitter.emit('gift_card.created', {
        gift_card_id: savedCard.id,
        code: savedCard.code,
        initial_balance: savedCard.initial_balance
      });

      return savedCard;
    });
  }

  /**
   * Redeems a gift card
   * @param dto Gift card redemption data
   * @returns Updated gift card
   */
  async redeemGiftCard(dto: RedeemGiftCardDto): Promise<GiftCard> {
    return await this.dataSource.transaction(async manager => {
      const giftCardRepo = manager.getRepository(GiftCard);

      // Find gift card with pessimistic lock
      const giftCard = await giftCardRepo.findOne({
        where: { code: dto.code },
        lock: { mode: 'pessimistic_write' }
      });

      if (!giftCard) {
        throw new NotFoundException('Gift card not found');
      }

      // Validate gift card status
      if (giftCard.status !== GiftCardStatus.ACTIVE) {
        throw new ConflictException(`Gift card is ${giftCard.status}`);
      }

      // Check expiration
      if (giftCard.expires_at && giftCard.expires_at <= new Date()) {
        giftCard.status = GiftCardStatus.EXPIRED;
        await giftCardRepo.save(giftCard);
        throw new ConflictException('Gift card has expired');
      }

      // Check balance
      if (giftCard.current_balance < dto.amount) {
        throw new ConflictException('Insufficient balance');
      }

      // Update balance
      giftCard.current_balance -= dto.amount;
      if (giftCard.current_balance === 0) {
        giftCard.status = GiftCardStatus.REDEEMED;
        giftCard.redeemed_at = new Date();
      }

      const updatedCard = await giftCardRepo.save(giftCard);

      // Emit redemption event
      this.eventEmitter.emit('gift_card.redeemed', {
        gift_card_id: updatedCard.id,
        code: updatedCard.code,
        amount: dto.amount,
        remaining_balance: updatedCard.current_balance
      });

      return updatedCard;
    });
  }

  /**
   * Cancels a gift card
   * @param id Gift card ID
   * @returns Cancelled gift card
   */
  async cancelGiftCard(id: string): Promise<GiftCard> {
    return await this.dataSource.transaction(async manager => {
      const giftCardRepo = manager.getRepository(GiftCard);

      const giftCard = await giftCardRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!giftCard) {
        throw new NotFoundException('Gift card not found');
      }

      if (giftCard.status !== GiftCardStatus.ACTIVE) {
        throw new ConflictException(`Cannot cancel ${giftCard.status} gift card`);
      }

      giftCard.status = GiftCardStatus.CANCELLED;
      const cancelledCard = await giftCardRepo.save(giftCard);

      // Emit cancellation event
      this.eventEmitter.emit('gift_card.cancelled', {
        gift_card_id: cancelledCard.id,
        code: cancelledCard.code,
        remaining_balance: cancelledCard.current_balance
      });

      return cancelledCard;
    });
  }

  /**
   * Gets gift card details
   * @param code Gift card code
   * @returns Gift card details
   */
  async getGiftCardByCode(code: string): Promise<GiftCard> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { code }
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    return giftCard;
  }

  /**
   * Checks for and expires gift cards past their expiration date
   * @returns Number of cards expired
   */
  async processExpiredCards(): Promise<number> {
    return await this.dataSource.transaction(async manager => {
      const giftCardRepo = manager.getRepository(GiftCard);

      const expiredCards = await giftCardRepo.find({
        where: {
          status: GiftCardStatus.ACTIVE,
          expires_at: LessThanOrEqual(new Date())
        }
      });

      if (expiredCards.length === 0) {
        return 0;
      }

      // Update status to expired
      await giftCardRepo.update(
        expiredCards.map(card => card.id),
        { status: GiftCardStatus.EXPIRED }
      );

      // Emit events for each expired card
      expiredCards.forEach(card => {
        this.eventEmitter.emit('gift_card.expired', {
          gift_card_id: card.id,
          code: card.code,
          remaining_balance: card.current_balance
        });
      });

      return expiredCards.length;
    });
  }
}
