import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbUtilsTestService } from './db-utils-test.service';
import { ShoppingCart, CartStatus } from '../../src/modules/carts/interfaces/shopping-cart.interface';
import { CartItem } from '../../src/modules/carts/interfaces/shopping-cart.interface';
import { Logger } from '@nestjs/common';

/**
 * Test version of the ShoppingCartRepository for integration tests
 * Provides the same functionality but uses the test database
 */
@Injectable()
export class ShoppingCartTestRepository {
  private readonly logger = new Logger(ShoppingCartTestRepository.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly dbUtilsService: DbUtilsTestService,
  ) {}

  /**
   * Get a shopping cart by its ID
   * @param cartId Shopping cart ID
   * @returns Promise resolving to cart or null if not found
   */
  async findById(cartId: string): Promise<ShoppingCart | null> {
    return this.dbUtilsService.executeIfTableExists(
      'shopping_carts',
      async () => {
        const result = await this.dataSource.query(
          `SELECT * FROM shopping_carts WHERE id = $1`,
          [cartId]
        );
        
        if (result.length === 0) {
          return null;
        }
        
        return result[0] as ShoppingCart;
      },
      null
    );
  }

  /**
   * Get all active carts
   * @returns Promise resolving to array of shopping carts
   */
  async findActive(): Promise<ShoppingCart[]> {
    return this.dbUtilsService.executeIfTableExists(
      'shopping_carts',
      async () => {
        const result = await this.dataSource.query(
          `SELECT * FROM shopping_carts WHERE status = $1`,
          [CartStatus.ACTIVE]
        );
        
        return result as ShoppingCart[];
      },
      []
    );
  }

  /**
   * Get count of active carts
   * @returns Promise resolving to count of active carts
   */
  async countActive(): Promise<number> {
    return this.dbUtilsService.executeIfTableExists(
      'shopping_carts',
      async () => {
        const result = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM shopping_carts WHERE status = $1`,
          [CartStatus.ACTIVE]
        );
        
        return parseInt(result[0]?.count || '0', 10);
      },
      0
    );
  }

  /**
   * Get total value of all active carts
   * @returns Promise resolving to sum of cart values
   */
  async getTotalCartValue(): Promise<number> {
    return this.dbUtilsService.executeIfTableExists(
      'cart_items',
      async () => {
        const result = await this.dataSource.query(`
          SELECT SUM(ci.price * ci.quantity) as total
          FROM cart_items ci
          INNER JOIN shopping_carts sc ON ci.cart_id = sc.id
          WHERE sc.status = $1
        `, [CartStatus.ACTIVE]);
        
        return parseFloat(result[0]?.total || '0');
      },
      0
    );
  }
} 