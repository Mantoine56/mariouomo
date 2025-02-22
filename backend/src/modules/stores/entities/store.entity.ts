import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * Store entity representing a merchant's store in the e-commerce platform
 * Each store can have multiple products and manages its own inventory
 */
@Entity('stores')
export class Store extends BaseEntity {
  @ApiProperty({ description: 'Store name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Store description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Store status (active/inactive/suspended)' })
  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'active'
  })
  status: string;

  @ApiProperty({ description: 'Store settings in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Store metadata in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @OneToMany(() => Product, product => product.store)
  products: Product[];
}
