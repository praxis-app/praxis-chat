import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PollActionRole } from '../../poll-actions/entities/poll-action-role.entity';
import { Server } from '../../servers/entities/server.entity';
import { User } from '../../users/user.entity';
import { ServerRolePermission } from './server-role-permission.entity';

@Entity()
export class ServerRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  color: string;

  @OneToMany(
    () => ServerRolePermission,
    (rolePermission) => rolePermission.serverRole,
    {
      cascade: true,
    },
  )
  permissions: ServerRolePermission[];

  @ManyToMany(() => User, (user) => user.serverRoles)
  @JoinTable({
    name: 'role_members_user',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @OneToMany(
    () => PollActionRole,
    (pollActionRole) => pollActionRole.serverRole,
  )
  pollActionRoles: PollActionRole[];

  @ManyToOne(() => Server, (server) => server.serverRoles, {
    onDelete: 'CASCADE',
  })
  server: Server;

  @Column({ type: 'uuid' })
  serverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
