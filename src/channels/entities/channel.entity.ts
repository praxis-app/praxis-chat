import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { ChannelKey } from './channel-key.entity';
import { ChannelMember } from './channel-member.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @OneToMany(() => ChannelMember, (member) => member.channel, {
    cascade: true,
  })
  members: ChannelMember[];

  @OneToMany(() => Proposal, (proposal) => proposal.channel, {
    cascade: true,
  })
  proposals: Proposal[];

  @OneToMany(() => ChannelKey, (key) => key.channel, {
    cascade: true,
  })
  keys: ChannelKey[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
