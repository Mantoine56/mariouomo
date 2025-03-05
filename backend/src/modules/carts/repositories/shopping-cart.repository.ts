import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbUtilsService } from '../../../common/database/db-utils.service';
import { ShoppingCart, CartStatus } from '../interfaces/shopping-cart.interface';
import { CartItem } from '../interfaces/shopping-cart.interface';
import { Logger } from '@nestjs/common';

/**
 * Repository for interacting with shopping carts and cart items
 */
@Injectable()
export class ShoppingCartRepository {
  private readonly logger = new Logger(ShoppingCartRepository.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly dbUtilsService: DbUtilsService,
  ) {}

  /**
   * Check if the shopping_carts table exists
   * @returns Promise<boolean> True if the table exists
   */
  async tableExists(): Promise<boolean> {
    return this.dbUtilsService.tableExists('shopping_carts');
  }

  /**
   * Find a cart by its ID
   * @param id The cart ID to find
   * @returns Promise<ShoppingCart | null> The found cart or null
   */
  async findById(id: string): Promise<ShoppingCart | null> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return null;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('shopping_carts', 'sc')
      .where('sc.id = :id', { id })
      .getRawOne<ShoppingCart>();
      
    return result || null;
  }

  /**
   * Find a cart by user ID
   * @param userId The user ID to find carts for
   * @param status Optional cart status filter
   * @returns Promise<ShoppingCart[]> The found carts
   */
  async findByUserId(
    userId: string,
    status?: CartStatus,
  ): Promise<ShoppingCart[]> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return [];
    }

    const query = this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('shopping_carts', 'sc')
      .where('sc.user_id = :userId', { userId });

    if (status) {
      query.andWhere('sc.status = :status', { status });
    }

    return query.getRawMany<ShoppingCart>();
  }

  /**
   * Find a cart by cart_id (client identifier)
   * @param cartId The client cart ID
   * @returns Promise<ShoppingCart | null> The found cart or null
   */
  async findByCartId(cartId: string): Promise<ShoppingCart | null> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return null;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('shopping_carts', 'sc')
      .where('sc.cart_id = :cartId', { cartId })
      .getRawOne<ShoppingCart>();
      
    return result || null;
  }

  /**
   * Create a new shopping cart
   * @param cart The cart data to create
   * @returns Promise<ShoppingCart> The created cart
   */
  async create(cart: Partial<ShoppingCart>): Promise<ShoppingCart> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      throw new Error('shopping_carts table does not exist');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('shopping_carts')
      .values(cart)
      .returning('*')
      .execute();

    return result.raw[0];
  }

  /**
   * Update an existing shopping cart
   * @param id The cart ID to update
   * @param data The cart data to update
   * @returns Promise<ShoppingCart> The updated cart
   */
  async update(
    id: string,
    data: Partial<ShoppingCart>,
  ): Promise<ShoppingCart> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      throw new Error('shopping_carts table does not exist');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .update('shopping_carts')
      .set(data)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  /**
   * Delete a shopping cart
   * @param id The cart ID to delete
   * @returns Promise<boolean> True if the cart was deleted
   */
  async delete(id: string): Promise<boolean> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return false;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from('shopping_carts')
      .where('id = :id', { id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /**
   * Find items in a shopping cart
   * @param cartId The cart ID to find items for
   * @returns Promise<CartItem[]> The cart items
   */
  async findCartItems(cartId: string): Promise<CartItem[]> {
    if (!(await this.dbUtilsService.tableExists('cart_items'))) {
      this.logger.warn('cart_items table does not exist');
      return [];
    }

    return this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('cart_items', 'ci')
      .where('ci.cart_id = :cartId', { cartId })
      .getRawMany<CartItem>();
  }

  /**
   * Add an item to a shopping cart
   * @param item The cart item to add
   * @returns Promise<CartItem> The created cart item
   */
  async addCartItem(item: Partial<CartItem>): Promise<CartItem> {
    if (!(await this.dbUtilsService.tableExists('cart_items'))) {
      this.logger.warn('cart_items table does not exist');
      throw new Error('cart_items table does not exist');
    }

    // Ensure we have the required fields for cart_items table
    if (!item.variant_id) {
      throw new Error('variant_id is required for cart items');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('cart_items')
      .values(item)
      .returning('*')
      .execute();

    return result.raw[0];
  }

  /**
   * Update a cart item
   * @param id The item ID to update
   * @param data The item data to update
   * @returns Promise<CartItem> The updated cart item
   */
  async updateCartItem(
    id: string,
    data: Partial<CartItem>,
  ): Promise<CartItem> {
    if (!(await this.dbUtilsService.tableExists('cart_items'))) {
      this.logger.warn('cart_items table does not exist');
      throw new Error('cart_items table does not exist');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .update('cart_items')
      .set(data)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  /**
   * Remove an item from a shopping cart
   * @param id The item ID to remove
   * @returns Promise<boolean> True if the item was removed
   */
  async removeCartItem(id: string): Promise<boolean> {
    if (!(await this.dbUtilsService.tableExists('cart_items'))) {
      this.logger.warn('cart_items table does not exist');
      return false;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from('cart_items')
      .where('id = :id', { id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /**
   * Find abandoned carts (not updated for a specific period)
   * @param cutoffMinutes Number of minutes of inactivity to consider a cart abandoned
   * @returns Promise<ShoppingCart[]> The abandoned carts
   */
  async findAbandonedCarts(cutoffMinutes = 30): Promise<ShoppingCart[]> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return [];
    }

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - cutoffMinutes);

    return this.dataSource
      .createQueryBuilder()
      .select('*')
      .from('shopping_carts', 'sc')
      .where('sc.status = :status', { status: CartStatus.ACTIVE })
      .andWhere('sc.updated_at < :cutoffTime', { cutoffTime })
      .getRawMany<ShoppingCart>();
  }

  /**
   * Mark abandoned carts with the abandoned status
   * @param cutoffMinutes Number of minutes of inactivity to consider a cart abandoned
   * @returns Promise<number> Number of carts marked as abandoned
   */
  async markAbandonedCarts(cutoffMinutes = 30): Promise<number> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return 0;
    }

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - cutoffMinutes);

    const result = await this.dataSource
      .createQueryBuilder()
      .update('shopping_carts')
      .set({ status: CartStatus.ABANDONED })
      .where('status = :status', { status: CartStatus.ACTIVE })
      .andWhere('updated_at < :cutoffTime', { cutoffTime })
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Get active cart metrics for analytics
   * @param cutoffMinutes Number of minutes to consider carts as active
   * @returns Promise<{ cart_count: number, cart_value: number }> Cart metrics
   */
  async getActiveCartMetrics(cutoffMinutes = 30): Promise<{
    cart_count: number;
    cart_value: number;
  }> {
    if (!(await this.tableExists())) {
      this.logger.warn('shopping_carts table does not exist');
      return { cart_count: 0, cart_value: 0 };
    }

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - cutoffMinutes);

    const result = await this.dataSource
      .createQueryBuilder()
      .select([
        'COUNT(*) as cart_count',
        'SUM(total) as cart_value',
      ])
      .from('shopping_carts', 'sc')
      .where('sc.status = :status', { status: CartStatus.ACTIVE })
      .andWhere('sc.updated_at >= :cutoffTime', { cutoffTime })
      .getRawOne<{ cart_count: string; cart_value: string }>();

    return {
      cart_count: parseInt(result?.cart_count || '0', 10),
      cart_value: parseFloat(result?.cart_value || '0'),
    };
  }
} 