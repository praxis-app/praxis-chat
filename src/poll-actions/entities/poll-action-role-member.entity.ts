import { ROLE_ATTRIBUTE_CHANGE_TYPE } from '@common/poll-actions/poll-action.constants';
import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { PollActionRole } from './poll-action-role.entity';

@Entity()
export class PollActionRoleMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ROLE_ATTRIBUTE_CHANGE_TYPE })
  changeType: RoleAttributeChangeType;

  @ManyToOne(() => User, (user) => user.pollActionRoleMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => PollActionRole, (pollActionRole) => pollActionRole.members, {
    onDelete: 'CASCADE',
  })
  pollActionRole: PollActionRole;

  @Column({ type: 'uuid' })
  pollActionRoleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
