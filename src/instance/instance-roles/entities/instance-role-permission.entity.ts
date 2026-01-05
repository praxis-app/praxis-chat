import { InstanceAbilitySubject } from '@common/roles/instance-roles/instance-ability';
import { INSTANCE_ROLE_ABILITY_SUBJECTS } from '@common/roles/instance-roles/instance-role.constants';
import { APP_ABILITY_ACTIONS } from '@common/roles/role.constants';
import { AppAbilityAction } from '@common/roles/role.types';
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

  @Column({ type: 'enum', enum: APP_ABILITY_ACTIONS })
  action: AppAbilityAction;

  @Column({ type: 'enum', enum: INSTANCE_ROLE_ABILITY_SUBJECTS })
  subject: InstanceAbilitySubject;

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
