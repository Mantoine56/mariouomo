import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from './profile.entity';

/**
 * UserAddress entity for storing user shipping and billing addresses
 */
@Entity('user_addresses')
export class UserAddress extends BaseEntity {
  @ApiProperty({ description: 'Reference to the user profile' })
  @Column({ type: 'uuid' })
  profile_id: string;

  @ApiProperty({ description: 'Address type (shipping/billing)' })
  @Column({ type: 'varchar', length: 20 })
  type: string;

  @ApiProperty({ description: 'Is this the default address of its type?' })
  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @ApiProperty({ description: 'Street address' })
  @Column({ type: 'varchar', length: 255 })
  street: string;

  @ApiProperty({ description: 'City' })
  @Column({ type: 'varchar', length: 100 })
  city: string;

  @ApiProperty({ description: 'State/Province/Region' })
  @Column({ type: 'varchar', length: 100 })
  state: string;

  @ApiProperty({ description: 'Country' })
  @Column({ type: 'varchar', length: 100 })
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @Column({ type: 'varchar', length: 20 })
  postal_code: string;

  @ApiProperty({ description: 'Additional address details' })
  @Column({ type: 'text', nullable: true })
  additional_details?: string;

  // Relationships
  @ManyToOne(() => Profile, profile => profile.addresses)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
