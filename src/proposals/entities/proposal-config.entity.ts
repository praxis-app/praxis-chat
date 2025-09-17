import { DECISION_MAKING_MODEL } from '@common/proposals/proposal.constants';
import { DecisionMakingModel } from '@common/proposals/proposal.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proposal } from './proposal.entity';

@Entity()
export class ProposalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DECISION_MAKING_MODEL })
  decisionMakingModel: DecisionMakingModel;

  @Column({ type: 'int' })
  standAsidesLimit: number;

  @Column({ type: 'int' })
  reservationsLimit: number;

  @Column({ type: 'int' })
  ratificationThreshold: number;

  @Column({ type: 'timestamp', nullable: true })
  closingAt?: Date;

  @OneToOne(() => Proposal, (proposal) => proposal.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposal: Proposal;

  @Column({ type: 'uuid' })
  proposalId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
