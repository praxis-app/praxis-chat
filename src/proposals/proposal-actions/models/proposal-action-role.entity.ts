import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../roles/models/role.entity';
import { ProposalActionPermission } from './proposal-action-permission.entity';
import { ProposalActionRoleMember } from './proposal-action-role-member.entity';
import { ProposalAction } from './proposal-action.entity';

@Entity()
export class ProposalActionRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  oldName?: string;

  @Column({ nullable: true })
  oldColor?: string;

  // TODO: This should be one to many
  @OneToOne(
    () => ProposalActionPermission,
    (permission) => permission.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  permission?: ProposalActionPermission;

  @OneToMany(
    () => ProposalActionRoleMember,
    (roleMember) => roleMember.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  members?: ProposalActionRoleMember[];

  @OneToOne(() => ProposalAction, (proposalAction) => proposalAction.role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposalAction: ProposalAction;

  @Column()
  proposalActionId: number;

  @ManyToOne(() => Role, (role) => role.proposalActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  role?: Role;

  @Column({ nullable: true })
  roleId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
