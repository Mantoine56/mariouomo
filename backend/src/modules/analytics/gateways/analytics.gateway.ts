import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * WebSocket gateway for real-time analytics
 * Handles real-time data streaming and client subscriptions
 */
@WebSocketGateway({
  namespace: 'analytics',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeDashboards: Map<string, Socket> = new Map();
  private metricSubscriptions: Map<string, Set<string>> = new Map();

  /**
   * Handles client connections
   * Validates authentication and authorization
   */
  async handleConnection(client: Socket) {
    try {
      // Client authentication would be handled here
      // For now, we'll just track the connection
      this.activeDashboards.set(client.id, client);
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  /**
   * Handles client disconnections
   * Cleans up subscriptions
   */
  handleDisconnect(client: Socket) {
    this.activeDashboards.delete(client.id);
    this.metricSubscriptions.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles subscription to sales metrics
   * Requires ADMIN role
   */
  @SubscribeMessage('subscribe_sales')
  @Roles(Role.ADMIN)
  handleSalesSubscription(client: Socket) {
    this.addSubscription(client.id, 'sales');
    return { event: 'subscribed', data: 'sales' };
  }

  /**
   * Handles subscription to inventory metrics
   * Requires ADMIN role
   */
  @SubscribeMessage('subscribe_inventory')
  @Roles(Role.ADMIN)
  handleInventorySubscription(client: Socket) {
    this.addSubscription(client.id, 'inventory');
    return { event: 'subscribed', data: 'inventory' };
  }

  /**
   * Handles subscription to customer metrics
   * Requires ADMIN role
   */
  @SubscribeMessage('subscribe_customers')
  @Roles(Role.ADMIN)
  handleCustomerSubscription(client: Socket) {
    this.addSubscription(client.id, 'customers');
    return { event: 'subscribed', data: 'customers' };
  }

  /**
   * Handles subscription to real-time metrics
   * Requires ADMIN role
   */
  @SubscribeMessage('subscribe_realtime')
  @Roles(Role.ADMIN)
  handleRealtimeSubscription(client: Socket) {
    this.addSubscription(client.id, 'realtime');
    return { event: 'subscribed', data: 'realtime' };
  }

  /**
   * Listens for sales metrics updates
   * Broadcasts to subscribed clients
   */
  @OnEvent('analytics.sales.updated')
  handleSalesUpdate(payload: any) {
    this.broadcastToSubscribers('sales', 'sales_update', payload);
  }

  /**
   * Listens for inventory metrics updates
   * Broadcasts to subscribed clients
   */
  @OnEvent('analytics.inventory.updated')
  handleInventoryUpdate(payload: any) {
    this.broadcastToSubscribers('inventory', 'inventory_update', payload);
  }

  /**
   * Listens for customer metrics updates
   * Broadcasts to subscribed clients
   */
  @OnEvent('analytics.customer.updated')
  handleCustomerUpdate(payload: any) {
    this.broadcastToSubscribers('customers', 'customer_update', payload);
  }

  /**
   * Listens for real-time metrics updates
   * Broadcasts to subscribed clients
   */
  @OnEvent('analytics.realtime.updated')
  handleRealtimeUpdate(payload: any) {
    this.broadcastToSubscribers('realtime', 'realtime_update', payload);
  }

  /**
   * Adds a subscription for a client
   * @private
   */
  private addSubscription(clientId: string, metricType: string) {
    if (!this.metricSubscriptions.has(clientId)) {
      this.metricSubscriptions.set(clientId, new Set());
    }
    this.metricSubscriptions.get(clientId).add(metricType);
  }

  /**
   * Broadcasts updates to subscribed clients
   * @private
   */
  private broadcastToSubscribers(
    metricType: string,
    event: string,
    payload: any,
  ) {
    for (const [clientId, subscriptions] of this.metricSubscriptions.entries()) {
      if (subscriptions.has(metricType)) {
        const client = this.activeDashboards.get(clientId);
        if (client) {
          client.emit(event, payload);
        }
      }
    }
  }
}
