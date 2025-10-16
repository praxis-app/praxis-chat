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
import { RolePermission } from './role-permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  color: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    cascade: true,
  })
  permissions: RolePermission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  members: User[];

  @OneToMany(() => PollActionRole, (pollActionRole) => pollActionRole.role)
  pollActionRoles: PollActionRole[];

  @ManyToOne(() => Server, (server) => server.roles, {
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
