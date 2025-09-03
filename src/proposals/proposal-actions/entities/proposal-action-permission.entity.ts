import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
  AbilityAction,
  AbilitySubject,
} from '../../../roles/app-ability';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ABILITY_ACTIONS })
  action: AbilityAction;

  @Column({ type: 'enum', enum: ABILITY_SUBJECTS })
  subject: AbilitySubject;

  @OneToOne(
    () => ProposalActionRole,
    (proposalActionRole) => proposalActionRole.permission,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
