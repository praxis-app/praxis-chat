import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '@common/poll-actions/poll-action.constants';
import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/roles/server-roles/server-ability';
import {
  SERVER_ABILITY_ACTIONS,
  SERVER_ABILITY_SUBJECTS,
} from '@common/roles/server-roles/server-role.constants';
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

  @Column({ type: 'enum', enum: SERVER_ABILITY_ACTIONS })
  action: ServerAbilityAction;

  @Column({ type: 'enum', enum: SERVER_ABILITY_SUBJECTS })
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
