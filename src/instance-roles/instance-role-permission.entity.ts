import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/roles/server-ability';
import {
  SERVER_ABILITY_ACTIONS,
  SERVER_ABILITY_SUBJECTS,
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
import { InstanceRole } from './instance-role.entity';

@Entity()
@Unique(['instanceRoleId', 'action', 'subject'])
export class InstanceRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SERVER_ABILITY_ACTIONS })
  action: ServerAbilityAction;

  @Column({ type: 'enum', enum: SERVER_ABILITY_SUBJECTS })
  subject: ServerAbilitySubject;

  @ManyToOne(() => InstanceRole, (instanceRole) => instanceRole.permissions, {
    onDelete: 'CASCADE',
  })
  instanceRole: InstanceRole;

  @Column({ type: 'uuid' })
  instanceRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
