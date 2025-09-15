import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '../proposal-action.constants';
import { RoleAttributeChangeType } from '../proposal-action.types';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionRoleMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ROLE_ATTRIBUTE_CHANGE_TYPE })
  changeType: RoleAttributeChangeType;

  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.members,
    {
      onDelete: 'CASCADE',
    },
  )
  proposalActionRole: ProposalActionRole;

  @Column({ type: 'uuid' })
  proposalActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
