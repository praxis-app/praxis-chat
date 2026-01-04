import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '@common/poll-actions/poll-action.constants';
import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import { ROLE_ABILITY_ACTIONS } from '@common/roles/role.constants';
import { RoleAbilityAction } from '@common/roles/role.types';
import { ServerAbilitySubject } from '@common/roles/server-roles/server-ability';
import { SERVER_ROLE_ABILITY_SUBJECTS } from '@common/roles/server-roles/server-role.constants';
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

  @Column({ type: 'enum', enum: ROLE_ABILITY_ACTIONS })
  action: RoleAbilityAction;

  @Column({ type: 'enum', enum: SERVER_ROLE_ABILITY_SUBJECTS })
  subject: ServerAbilitySubject;

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
