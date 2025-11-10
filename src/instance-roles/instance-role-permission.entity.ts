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
import { InstanceRole } from './instance-role.entity';

@Entity()
@Unique(['instanceRoleId', 'action', 'subject'])
export class InstanceRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

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
