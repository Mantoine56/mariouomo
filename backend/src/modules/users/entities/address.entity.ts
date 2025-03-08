/**
 * Entity representing a user's address in the system
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => Profile, profile => profile.addresses)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postal_code: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
