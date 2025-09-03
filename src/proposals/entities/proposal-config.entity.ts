import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DECISION_MAKING_MODEL } from '../proposal.constants';
import { DecisionMakingModel } from '../proposal.types';
import { Proposal } from './proposal.entity';

@Entity()
export class ProposalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DECISION_MAKING_MODEL })
  decisionMakingModel: DecisionMakingModel;

  @Column()
  standAsidesLimit: number;

  @Column()
  reservationsLimit: number;

  @Column()
  ratificationThreshold: number;

  @Column({ nullable: true })
  closingAt?: Date;

  @OneToOne(() => Proposal, (proposal) => proposal.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposal: Proposal;

  @Column()
  proposalId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
