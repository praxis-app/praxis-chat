import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { CHANGE_TYPE } from '../proposal-action.constants';
import { ChangeType } from '../proposal-action.types';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionRoleMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CHANGE_TYPE })
  changeType: ChangeType;

  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.members,
    {
      onDelete: 'CASCADE',
    },
  )
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
