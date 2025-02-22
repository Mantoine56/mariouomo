import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order } from '../entities/order.entity';

/**
 * Controller handling order-related endpoints
 * Implements proper authentication and authorization
 */
@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Creates a new order
   * @param req Request object containing user information
   * @param createOrderDto Order creation data
   * @returns Created order
   */
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: Order,
  })
  async createOrder(
    @Request() req: { user: { id: string } },
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  /**
   * Updates an order's status (admin only)
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order updated successfully',
    type: Order,
  })
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  /**
   * Gets a specific order by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order found',
    type: Order,
  })
  async getOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.orderService.findOrderById(id);
  }

  /**
   * Gets orders for the current user
   * @param req Request object containing user information
   * @returns List of user's orders
   */
  @Get('my-orders')
  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders found',
    type: [Order],
  })
  async getUserOrders(@Request() req: { user: { id: string } }): Promise<Order[]> {
    return this.orderService.findOrdersByUser(req.user.id);
  }
}
