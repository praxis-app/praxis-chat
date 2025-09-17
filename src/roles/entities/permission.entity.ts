import { AbilityAction, AbilitySubject } from '@common/roles/app-ability';
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
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
@Unique(['roleId', 'action', 'subject'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @ManyToOne(() => Role, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  role: Role;

  @Column({ type: 'uuid' })
  roleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
