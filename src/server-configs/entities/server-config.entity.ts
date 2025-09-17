import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { DecisionMakingModel } from '@common/proposals/proposal.types';
import { VotingTimeLimit } from '@common/votes/vote.constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ServerConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DECISION_MAKING_MODEL, default: 'consensus' })
  decisionMakingModel: DecisionMakingModel;

  @Column({ default: 2 })
  standAsidesLimit: number;

  @Column({ default: 2 })
  reservationsLimit: number;

  @Column({ default: 51 })
  ratificationThreshold: number;

  @Column({ default: VotingTimeLimit.Unlimited })
  votingTimeLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
