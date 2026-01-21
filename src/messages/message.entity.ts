import { COMMAND_STATUS } from '@common/commands/command.constants';
import { CommandStatus } from '@common/commands/command.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bot } from '../bots/bot.entity';
import { ChannelKey } from '../channels/entities/channel-key.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea', nullable: true })
  ciphertext: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  iv: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  tag: Buffer | null;

  @OneToMany(() => Image, (image) => image.message)
  images: Image[];

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  user: User | null;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => Bot, (bot) => bot.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  bot: Bot | null;

  @Column({ type: 'uuid', nullable: true })
  botId: string | null;

  @Column({ type: 'enum', enum: COMMAND_STATUS, nullable: true })
  commandStatus: CommandStatus | null;

  @ManyToOne(() => ChannelKey, (key) => key.messages)
  key?: ChannelKey;

  @Column({ type: 'uuid', nullable: true })
  keyId: string | null;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
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
