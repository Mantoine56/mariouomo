import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Shipment } from '../entities/shipment.entity';
import { Order } from '../../orders/entities/order.entity';
import { ShipmentStatus } from '../enums/shipment-status.enum';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from '../dto/update-shipment-status.dto';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private eventEmitter: EventEmitter2
  ) {}

  async createShipment(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const order = await this.orderRepository.findOne({
      where: { id: createShipmentDto.order_id }
    });

    if (!order) {
      throw new BadRequestException(`Order with ID ${createShipmentDto.order_id} not found`);
    }

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      status: ShipmentStatus.PENDING
    });

    const savedShipment = await this.shipmentRepository.save(shipment);
    this.eventEmitter.emit('shipment.created', savedShipment);
    return savedShipment;
  }

  async updateShipmentStatus(
    id: string,
    updateDto: UpdateShipmentStatusDto
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id }
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // Validate status transition
    if (!this.isValidStatusTransition(shipment.status, updateDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${shipment.status} to ${updateDto.status}`
      );
    }

    // Update shipment
    Object.assign(shipment, updateDto);
    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Emit appropriate event based on status
    this.emitStatusEvent(updatedShipment);

    return updatedShipment;
  }

  async getShipment(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['order']
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async getOrderShipments(orderId: string): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: { order_id: orderId },
      order: { created_at: 'DESC' }
    });
  }

  async markAsDelivered(
    id: string,
    deliveryDetails: { delivered_at: Date; tracking_history?: any[] }
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id }
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    Object.assign(shipment, {
      status: ShipmentStatus.DELIVERED,
      delivered_at: deliveryDetails.delivered_at,
      tracking_history: deliveryDetails.tracking_history
    });

    const updatedShipment = await this.shipmentRepository.save(shipment);
    this.eventEmitter.emit('shipment.delivered', updatedShipment);
    return updatedShipment;
  }

  private isValidStatusTransition(
    currentStatus: ShipmentStatus,
    newStatus: ShipmentStatus
  ): boolean {
    const validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      [ShipmentStatus.PENDING]: [
        ShipmentStatus.PROCESSING,
        ShipmentStatus.CANCELLED
      ],
      [ShipmentStatus.PROCESSING]: [
        ShipmentStatus.SHIPPED,
        ShipmentStatus.FAILED,
        ShipmentStatus.CANCELLED
      ],
      [ShipmentStatus.SHIPPED]: [
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.FAILED,
        ShipmentStatus.CANCELLED
      ],
      [ShipmentStatus.IN_TRANSIT]: [
        ShipmentStatus.DELIVERED,
        ShipmentStatus.FAILED,
        ShipmentStatus.CANCELLED
      ],
      [ShipmentStatus.DELIVERED]: [], // Terminal state
      [ShipmentStatus.FAILED]: [ShipmentStatus.PROCESSING], // Can retry
      [ShipmentStatus.CANCELLED]: [] // Terminal state
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private emitStatusEvent(shipment: Shipment): void {
    const eventMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'shipment.pending',
      [ShipmentStatus.PROCESSING]: 'shipment.processing',
      [ShipmentStatus.SHIPPED]: 'shipment.shipped',
      [ShipmentStatus.IN_TRANSIT]: 'shipment.in_transit',
      [ShipmentStatus.DELIVERED]: 'shipment.delivered',
      [ShipmentStatus.FAILED]: 'shipment.failed',
      [ShipmentStatus.CANCELLED]: 'shipment.cancelled'
    };

    const eventName = eventMap[shipment.status];
    if (eventName) {
      this.eventEmitter.emit(eventName, shipment);
    }
  }
}
