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
import { PollActionRole } from '../../../poll-actions/entities/poll-action-role.entity';
import { Server } from '../../entities/server.entity';
import { User } from '../../../users/user.entity';
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
    (rolePermission: ServerRolePermission) => rolePermission.serverRole,
    {
      cascade: true,
    },
  )
  permissions: ServerRolePermission[];

  @ManyToMany(() => User, (user: User) => user.serverRoles)
  @JoinTable()
  members: User[];

  @OneToMany(
    () => PollActionRole,
    (pollActionRole: PollActionRole) => pollActionRole.serverRole,
  )
  pollActionRoles: PollActionRole[];

  @ManyToOne(() => Server, (server: Server) => server.serverRoles, {
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
