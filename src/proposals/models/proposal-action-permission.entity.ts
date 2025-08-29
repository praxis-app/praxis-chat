// TODO: Determine how proposed permission changes will be persisted

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionPermission {
  @PrimaryGeneratedColumn()
  id: number;

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
