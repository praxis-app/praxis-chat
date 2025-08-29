import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PROPOSAL_ACTION_TYPE } from '../proposal.constants';
import { ProposalActionType } from '../proposal.types';
import { ProposalActionRole } from './proposal-action-role.entity';
import { Proposal } from './proposal.entity';

@Entity()
export class ProposalAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PROPOSAL_ACTION_TYPE })
  actionType: ProposalActionType;

  @OneToOne(
    () => ProposalActionRole,
    (proposedRole) => proposedRole.proposalAction,
    {
      cascade: true,
      nullable: true,
    },
  )
  role?: ProposalActionRole;

  @OneToOne(() => Proposal, (proposal) => proposal.action, {
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
