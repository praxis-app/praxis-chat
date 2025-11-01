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
import { ServerRole } from '../../server-roles/entities/server-role.entity';
import { PollActionPermission } from './poll-action-permission.entity';
import { PollActionRoleMember } from './poll-action-role-member.entity';
import { PollAction } from './poll-action.entity';

@Entity()
export class PollActionRole {
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
    () => PollActionPermission,
    (permission) => permission.pollActionRole,
    {
      cascade: true,
      nullable: true,
    },
  )
  permissions?: PollActionPermission[];

  @OneToMany(() => PollActionRoleMember, (member) => member.pollActionRole, {
    cascade: true,
    nullable: true,
  })
  members?: PollActionRoleMember[];

  @OneToOne(() => PollAction, (pollAction) => pollAction.serverRole, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pollAction: PollAction;

  @Column({ type: 'uuid' })
  pollActionId: string;

  @ManyToOne(() => ServerRole, (role) => role.pollActionRoles, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  serverRole?: ServerRole;

  @Column({ name: 'roleId', type: 'uuid', nullable: true })
  serverRoleId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
