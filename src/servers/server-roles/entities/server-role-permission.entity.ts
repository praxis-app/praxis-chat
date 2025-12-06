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
import { ServerRole } from './server-role.entity';

@Entity()
@Unique(['serverRoleId', 'action', 'subject'])
export class ServerRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SERVER_ABILITY_ACTIONS })
  action: ServerAbilityAction;

  @Column({ type: 'enum', enum: SERVER_ABILITY_SUBJECTS })
  subject: ServerAbilitySubject;

  @ManyToOne(() => ServerRole, (serverRole) => serverRole.permissions, {
    onDelete: 'CASCADE',
  })
  serverRole: ServerRole;

  @Column({ type: 'uuid' })
  serverRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
