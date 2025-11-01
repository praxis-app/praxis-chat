import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '@common/poll-actions/poll-action.constants';
import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import { AbilityAction, AbilitySubject } from '@common/roles/app-ability';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
} from '@common/roles/server-role.constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PollActionRole } from './poll-action-role.entity';

@Entity()
@Unique(['pollActionRoleId', 'action', 'subject'])
export class PollActionPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @Column({ type: 'enum', enum: ROLE_ATTRIBUTE_CHANGE_TYPE })
  changeType: RoleAttributeChangeType;

  @ManyToOne(
    () => PollActionRole,
    (pollActionRole) => pollActionRole.permissions,
    {
      onDelete: 'CASCADE',
    },
  )
  pollActionRole: PollActionRole;

  @Column({ type: 'uuid' })
  pollActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
