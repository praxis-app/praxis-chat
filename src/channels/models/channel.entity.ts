import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Proposal } from '../../proposals/models/proposal.entity';
import { ChannelMember } from './channel-member.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
