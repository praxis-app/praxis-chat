import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
  AbilityAction,
  AbilitySubject,
} from '../../roles/app-ability';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @ManyToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.permissions,
    {
      onDelete: 'CASCADE',
    },
  )
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
