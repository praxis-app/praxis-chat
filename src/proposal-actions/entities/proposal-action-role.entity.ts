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
import { Role } from '../../roles/entities/role.entity';
import { ProposalActionPermission } from './proposal-action-permission.entity';
import { ProposalActionRoleMember } from './proposal-action-role-member.entity';
import { ProposalAction } from './proposal-action.entity';

@Entity()
export class ProposalActionRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  oldName?: string;

  @Column({ nullable: true })
  oldColor?: string;

  @OneToMany(
    () => ProposalActionPermission,
    (rolePermission) => rolePermission.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  permissions?: ProposalActionPermission[];

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
  proposalActionId: string;

  @ManyToOne(() => Role, (role) => role.proposalActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  role?: Role;

  @Column({ nullable: true })
  roleId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
