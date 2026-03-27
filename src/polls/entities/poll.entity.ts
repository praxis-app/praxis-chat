/**
 * Used for reference:
 * - https://github.com/forrestwilkins/anrcho/blob/master/app/models/proposal.rb
 * - https://github.com/praxis-app/praxis/blob/main/src/proposals/models/proposal.model.ts
 */

import { POLL_STAGE, POLL_TYPE } from '@common/polls/poll.constants';
import { PollStage, PollType } from '@common/polls/poll.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelKey } from '../../channels/entities/channel-key.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { Image } from '../../images/entities/image.entity';
import { PollAction } from '../../poll-actions/entities/poll-action.entity';
import { User } from '../../users/user.entity';
import { Vote } from '../../votes/vote.entity';
import { PollConfig } from './poll-config.entity';
import { PollOption } from './poll-option.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea', nullable: true })
  ciphertext: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  iv: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  tag: Buffer | null;

  @ManyToOne(() => ChannelKey, (key) => key.polls)
  key?: ChannelKey;

  @Column({ type: 'uuid', nullable: true })
  keyId: string | null;

  @Column({ type: 'enum', default: 'voting', enum: POLL_STAGE })
  stage: PollStage;

  @Column({ type: 'enum', default: 'proposal', enum: POLL_TYPE })
  pollType: PollType;

  @OneToOne(() => PollAction, (action) => action.poll, {
    cascade: true,
  })
  action: PollAction;

  @OneToOne(() => PollConfig, (pollConfig) => pollConfig.poll, {
    cascade: true,
  })
  config: PollConfig;

  @OneToMany(() => Vote, (vote) => vote.poll, {
    cascade: true,
  })
  votes: Vote[];

  @OneToMany(() => Image, (image) => image.poll, {
    cascade: true,
  })
  images: Image[];

  @OneToMany(() => PollOption, (option) => option.poll, {
    cascade: true,
  })
  options: PollOption[];

  @ManyToOne(() => User, (user) => user.polls, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Channel, (channel) => channel.polls, {
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
