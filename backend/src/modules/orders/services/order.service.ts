import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Profile } from '../../users/entities/profile.entity';

/**
 * Service handling order-related business logic
 * Implements proper concurrency handling and transaction management
 */
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new order with proper inventory checks and transaction management
   * @param userId - ID of the user creating the order
   * @param dto - Order creation data
   * @returns Created order with items
   */
  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    // Start a transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Get user profile and verify existence
      const profile = await this.profileRepository.findOneBy({ id: userId });
      if (!profile) {
        throw new NotFoundException('User profile not found');
      }

      // Lock and validate all product variants
      const variantIds = dto.items.map(item => item.variant_id);
      const variants = await manager
        .createQueryBuilder(ProductVariant, 'variant')
        .setLock('pessimistic_write')
        .whereInIds(variantIds)
        .getMany();

      if (variants.length !== variantIds.length) {
        throw new NotFoundException('One or more product variants not found');
      }

      // Check inventory and calculate totals
      let subtotal = 0;
      const variantMap = new Map(variants.map(v => [v.id, v]));
      
      for (const item of dto.items) {
        const variant = variantMap.get(item.variant_id);
        if (variant.stock_quantity < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for variant: ${variant.name}`
          );
        }
        subtotal += variant.price * item.quantity;
      }

      // Calculate order totals (simplified tax and shipping for now)
      const tax = subtotal * 0.1; // 10% tax
      const shipping = 10; // Flat rate shipping
      const total_amount = subtotal + tax + shipping;

      // Create order
      const order = manager.create(Order, {
        user_id: userId,
        subtotal,
        tax,
        shipping,
        total_amount,
        status: OrderStatus.PENDING,
        shipping_address: dto.shipping_address,
        billing_address: dto.billing_address,
        customer_notes: dto.customer_notes,
        metadata: dto.metadata,
      });

      const savedOrder = await manager.save(Order, order);

      // Create order items and update inventory
      const orderItems = await Promise.all(
        dto.items.map(async (item) => {
          const variant = variantMap.get(item.variant_id);
          
          // Update inventory
          variant.stock_quantity -= item.quantity;
          await manager.save(ProductVariant, variant);

          // Create order item
          const orderItem = manager.create(OrderItem, {
            order_id: savedOrder.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: variant.price,
            subtotal: variant.price * item.quantity,
            product_name: variant.product_name,
            variant_name: variant.name,
            product_metadata: {
              sku: variant.sku,
              weight: variant.weight,
              dimensions: variant.dimensions,
            },
          });

          return manager.save(OrderItem, orderItem);
        })
      );

      // Return complete order with items
      return this.findOrderById(savedOrder.id);
    });
  }

  /**
   * Updates an order's status and notes
   * @param orderId - ID of the order to update
   * @param dto - Update data
   * @returns Updated order
   */
  async updateOrder(orderId: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Handle status transitions
    if (dto.status && dto.status !== order.status) {
      await this.handleStatusTransition(order, dto.status);
    }

    // Update allowed fields
    Object.assign(order, {
      status: dto.status,
      staff_notes: dto.staff_notes,
      customer_notes: dto.customer_notes,
    });

    return this.orderRepository.save(order);
  }

  /**
   * Finds an order by ID with all related items
   * @param orderId - ID of the order to find
   * @returns Order with items
   */
  async findOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Lists all orders for a user
   * @param userId - ID of the user
   * @returns Array of orders
   */
  async findOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Handles order status transitions with proper validation
   * @param order - Current order
   * @param newStatus - New status to transition to
   */
  private async handleStatusTransition(
    order: Order,
    newStatus: OrderStatus,
  ): Promise<void> {
    // Define valid status transitions
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    // Check if transition is valid
    if (!validTransitions[order.status].includes(newStatus)) {
      throw new ConflictException(
        `Invalid status transition from ${order.status} to ${newStatus}`
      );
    }

    // Handle inventory for cancellations
    if (newStatus === OrderStatus.CANCELLED) {
      await this.handleOrderCancellation(order);
    }
  }

  /**
   * Handles inventory updates when an order is cancelled
   * @param order - Order being cancelled
   */
  private async handleOrderCancellation(order: Order): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Return inventory for each item
      for (const item of order.items) {
        await manager.increment(
          ProductVariant,
          { id: item.variant_id },
          'stock_quantity',
          item.quantity
        );
      }
    });
  }
}
