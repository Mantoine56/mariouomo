import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { UserAddress } from './user-address.entity';

/**
 * Profile entity representing a user's profile in the system
 * Links to Supabase Auth user and contains additional user information
 */
@Entity('profiles')
export class Profile extends BaseEntity {
  @ApiProperty({ description: 'User\'s full name' })
  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @ApiProperty({ description: 'User\'s role (customer/admin/manager)' })
  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'customer'
  })
  role: string;

  @ApiProperty({ description: 'User\'s account status' })
  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'active'
  })
  status: string;

  @ApiProperty({ description: 'User\'s email (from Supabase Auth)' })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({ description: 'User\'s phone number' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'User preferences in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => UserAddress, address => address.profile)
  addresses: UserAddress[];
}
