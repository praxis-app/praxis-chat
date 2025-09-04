import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ProposalActionRole } from './proposal-action-role.entity';

@Entity()
export class ProposalActionRoleMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  changeType: string;

  @ManyToOne(() => User, (user) => user.proposalActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => ProposalActionRole, (role) => role.members, {
    onDelete: 'CASCADE',
  })
  proposalActionRole: ProposalActionRole;

  @Column()
  proposalActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
