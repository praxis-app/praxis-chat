import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channel } from './channel.entity';
import { User } from '../../users/user.entity';

@Entity()
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  lastMessageReadId: string | null;

  @ManyToOne(() => User, (user) => user.channelMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Channel, (channel) => channel.members, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @Column({ type: 'uuid' })
  channelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
