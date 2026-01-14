import { DECISION_MAKING_MODEL } from '@common/polls/poll.constants';
import { DecisionMakingModel } from '@common/polls/poll.types';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Server } from '../../entities/server.entity';

@Entity()
export class ServerConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DECISION_MAKING_MODEL, default: 'consensus' })
  decisionMakingModel: DecisionMakingModel;

  @Column({ default: 2 })
  disagreementsLimit: number;

  @Column({ default: 2 })
  abstainsLimit: number;

  @Column({ default: 51 })
  ratificationThreshold: number;

  @Column({ type: 'boolean', default: true })
  quorumEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  quorumThreshold: number;

  @Column({ default: VotingTimeLimit.Unlimited })
  votingTimeLimit: number;

  @Column({ default: false })
  anonymousUsersEnabled: boolean;

  @OneToOne(() => Server, (server: Server) => server.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  server: Server;

  @Column({ type: 'uuid' })
  serverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
