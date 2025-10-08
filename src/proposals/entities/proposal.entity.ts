/**
 * Used for reference:
 * - https://github.com/forrestwilkins/anrcho/blob/master/app/models/proposal.rb
 * - https://github.com/praxis-app/praxis/blob/main/src/proposals/models/proposal.model.ts
 */

import { PROPOSAL_STAGE } from '@common/proposals/proposal.constants';
import { ProposalStage } from '@common/proposals/proposal.types';
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
import { ProposalAction } from '../../proposal-actions/entities/proposal-action.entity';
import { User } from '../../users/user.entity';
import { Vote } from '../../votes/vote.entity';
import { ProposalConfig } from './proposal-config.entity';

@Entity()
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea', nullable: true })
  ciphertext: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  iv: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  tag: Buffer | null;

  @ManyToOne(() => ChannelKey, (key) => key.proposals)
  key?: ChannelKey;

  @Column({ type: 'uuid', nullable: true })
  keyId: string | null;

  @Column({ type: 'enum', default: 'voting', enum: PROPOSAL_STAGE })
  stage: ProposalStage;

  @OneToOne(() => ProposalAction, (action) => action.proposal, {
    cascade: true,
  })
  action: ProposalAction;

  @OneToOne(() => ProposalConfig, (proposalConfig) => proposalConfig.proposal, {
    cascade: true,
  })
  config: ProposalConfig;

  @OneToMany(() => Vote, (vote) => vote.proposal, {
    cascade: true,
  })
  votes: Vote[];

  @OneToMany(() => Image, (image) => image.proposal, {
    cascade: true,
  })
  images: Image[];

  @ManyToOne(() => User, (user) => user.proposals, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Channel, (channel) => channel.proposals, {
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
