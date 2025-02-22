/**
 * Interface representing a user profile in the system
 */
import { Order } from '../../orders/entities/order.entity';
import { Address } from '../entities/address.entity';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  status: string;
  orders: Order[];
  addresses: Address[];
  created_at: Date;
  updated_at: Date;
}
