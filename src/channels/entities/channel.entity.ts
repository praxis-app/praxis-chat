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
import { Poll } from '../../polls/entities/poll.entity';
import { Server } from '../../servers/server.entity';
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

  @OneToMany(() => Poll, (poll) => poll.channel, {
    cascade: true,
  })
  polls: Poll[];

  @OneToMany(() => ChannelKey, (key) => key.channel, {
    cascade: true,
  })
  keys: ChannelKey[];

  @ManyToOne(() => Server, (server) => server.channels, {
    onDelete: 'CASCADE',
  })
  server: Server;

  @Column({ type: 'uuid' })
  serverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
