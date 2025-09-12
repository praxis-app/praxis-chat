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

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  color?: string;

  @Column({ type: 'varchar', nullable: true })
  prevName?: string;

  @Column({ type: 'varchar', nullable: true })
  prevColor?: string;

  @OneToMany(
    () => ProposalActionPermission,
    (permission) => permission.proposalActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  permissions?: ProposalActionPermission[];

  @OneToMany(
    () => ProposalActionRoleMember,
    (member) => member.proposalActionRole,
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

  @Column({ type: 'uuid' })
  proposalActionId: string;

  @ManyToOne(() => Role, (role) => role.proposalActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  role?: Role;

  @Column({ type: 'uuid', nullable: true })
  roleId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
