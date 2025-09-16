import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
} from '@common/roles/role.constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbilityAction, AbilitySubject } from '../../roles/app-ability';
import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '../proposal-action.constants';
import { RoleAttributeChangeType } from '../proposal-action.types';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @Column({ type: 'enum', enum: ROLE_ATTRIBUTE_CHANGE_TYPE })
  changeType: RoleAttributeChangeType;

  @ManyToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.permissions,
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
