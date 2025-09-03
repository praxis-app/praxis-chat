import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/user.entity';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionRoleMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  changeType: string;

  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => ProposalActionRole, (role) => role.members, {
    onDelete: 'CASCADE',
  })
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
