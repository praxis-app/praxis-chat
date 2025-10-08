import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { Channel } from './channel.entity';

@Entity()
export class ChannelKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' })
  wrappedKey: Buffer;

  @Column({ type: 'bytea' })
  iv: Buffer;

  @Column({ type: 'bytea' })
  tag: Buffer;

  @OneToMany(() => Message, (message) => message.key)
  messages: Message[];

  @OneToMany(() => Proposal, (proposal) => proposal.key)
  proposals: Proposal[];

  @ManyToOne(() => Channel, (channel) => channel.keys, {
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
