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
import { ServerRole } from './server-role.entity';

@Entity({ name: 'role_permission' })
@Unique(['serverRoleId', 'action', 'subject'])
export class ServerRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @ManyToOne(() => ServerRole, (serverRole) => serverRole.permissions, {
    onDelete: 'CASCADE',
  })
  serverRole: ServerRole;

  @Column({ name: 'roleId', type: 'uuid' })
  serverRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
