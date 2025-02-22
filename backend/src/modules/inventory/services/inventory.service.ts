import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryItem } from '../entities/inventory-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { AdjustInventoryDto } from '../dtos/adjust-inventory.dto';

/**
 * Service handling inventory-related business logic
 * Implements proper locking and concurrent access handling
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new inventory item with initial stock
   * @param dto Creation data
   * @returns Created inventory item
   */
  async createInventoryItem(dto: CreateInventoryDto): Promise<InventoryItem> {
    return await this.dataSource.transaction(async (manager) => {
      // Verify variant exists
      const variant = await manager.findOne(ProductVariant, {
        where: { id: dto.variant_id },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      // Check for existing inventory in the same location
      const existing = await manager.findOne(InventoryItem, {
        where: {
          variant_id: dto.variant_id,
          location: dto.location,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Inventory item already exists for this variant and location',
        );
      }

      // Create inventory item
      const item = manager.create(InventoryItem, {
        ...dto,
        reserved_quantity: 0,
      });

      const savedItem = await manager.save(InventoryItem, item);

      // Emit inventory created event
      this.eventEmitter.emit('inventory.created', {
        inventory_id: savedItem.id,
        variant_id: savedItem.variant_id,
        quantity: savedItem.quantity,
      });

      return savedItem;
    });
  }

  /**
   * Updates inventory item settings
   * @param id Inventory item ID
   * @param dto Update data
   * @returns Updated inventory item
   */
  async updateInventoryItem(
    id: string,
    dto: UpdateInventoryDto,
  ): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Update fields
    Object.assign(item, dto);

    const savedItem = await this.inventoryRepository.save(item);

    // Check if we need to emit low stock event
    if (
      savedItem.quantity <= savedItem.reorder_point &&
      savedItem.reorder_point > 0
    ) {
      this.eventEmitter.emit('inventory.low_stock', {
        inventory_id: savedItem.id,
        variant_id: savedItem.variant_id,
        quantity: savedItem.quantity,
        reorder_point: savedItem.reorder_point,
      });
    }

    return savedItem;
  }

  /**
   * Adjusts inventory quantity with proper locking
   * @param id Inventory item ID
   * @param dto Adjustment data
   * @returns Updated inventory item
   */
  async adjustInventory(
    id: string,
    dto: AdjustInventoryDto,
  ): Promise<InventoryItem> {
    return await this.dataSource.transaction(async (manager) => {
      // Lock the inventory item
      const item = await manager.findOne(InventoryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      // Calculate new quantity
      const newQuantity = item.quantity + dto.adjustment;

      // Validate new quantity
      if (newQuantity < 0) {
        throw new ConflictException('Insufficient inventory');
      }

      // Update quantity
      item.quantity = newQuantity;
      item.version += 1;

      const savedItem = await manager.save(InventoryItem, item);

      // Create inventory movement record
      await manager.insert('inventory_movements', {
        inventory_item_id: id,
        quantity: dto.adjustment,
        reason: dto.reason,
        reference: dto.reference,
        notes: dto.notes,
      });

      // Emit events based on adjustment type
      if (dto.adjustment < 0) {
        this.eventEmitter.emit('inventory.adjusted', {
          inventory_id: id,
          quantity: Math.abs(dto.adjustment),
          reason: dto.reason,
          type: 'decrease',
        });
      } else {
        this.eventEmitter.emit('inventory.adjusted', {
          inventory_id: id,
          quantity: dto.adjustment,
          reason: dto.reason,
          type: 'increase',
        });
      }

      // Check for low stock
      if (
        savedItem.quantity <= savedItem.reorder_point &&
        savedItem.reorder_point > 0
      ) {
        this.eventEmitter.emit('inventory.low_stock', {
          inventory_id: savedItem.id,
          variant_id: savedItem.variant_id,
          quantity: savedItem.quantity,
          reorder_point: savedItem.reorder_point,
        });
      }

      return savedItem;
    });
  }

  /**
   * Reserves inventory for an order
   * @param id Inventory item ID
   * @param quantity Quantity to reserve
   * @returns Updated inventory item
   */
  async reserveInventory(id: string, quantity: number): Promise<InventoryItem> {
    return await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(InventoryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      const availableQuantity = item.quantity - item.reserved_quantity;
      if (availableQuantity < quantity) {
        throw new ConflictException('Insufficient available inventory');
      }

      item.reserved_quantity += quantity;

      const savedItem = await manager.save(InventoryItem, item);

      // Create reservation record
      await manager.insert('inventory_movements', {
        inventory_item_id: id,
        quantity: -quantity,
        reason: 'RESERVATION',
        reference: null,
      });

      // Emit reservation event
      this.eventEmitter.emit('inventory.reserved', {
        inventory_id: id,
        quantity: quantity,
      });

      return savedItem;
    });
  }

  /**
   * Releases previously reserved inventory
   * @param id Inventory item ID
   * @param quantity Quantity to release
   * @returns Updated inventory item
   */
  async releaseInventory(id: string, quantity: number): Promise<InventoryItem> {
    return await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(InventoryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      if (item.reserved_quantity < quantity) {
        throw new ConflictException('Cannot release more than reserved quantity');
      }

      item.reserved_quantity -= quantity;
      return manager.save(InventoryItem, item);
    });
  }

  /**
   * Gets inventory items that need reordering
   * @returns Array of low stock inventory items
   */
  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.quantity <= item.reorder_point')
      .andWhere('item.reorder_point > 0')
      .getMany();
  }

  /**
   * Gets inventory item by ID with variant information
   * @param id Inventory item ID
   * @returns Inventory item with variant
   */
  async findInventoryById(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['variant'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  /**
   * Gets all inventory items for a variant across locations
   * @param variantId Product variant ID
   * @returns Array of inventory items
   */
  async findInventoryByVariant(variantId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { variant_id: variantId },
      order: { location: 'ASC' },
    });
  }

  /**
   * Gets inventory items by location
   * @param location Location/warehouse
   * @returns Array of inventory items
   */
  async findInventoryByLocation(location: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { location },
      relations: ['variant'],
      order: { variant_id: 'ASC' },
    });
  }
}
