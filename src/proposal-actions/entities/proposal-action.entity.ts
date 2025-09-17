import { PROPOSAL_ACTION_TYPE } from '@common/proposal-actions/proposal-action.constants';
import { ProposalActionType } from '@common/proposal-actions/proposal-action.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { ProposalActionRole } from './proposal-action-role.entity';

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

  @Column({ type: 'uuid' })
  proposalId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
