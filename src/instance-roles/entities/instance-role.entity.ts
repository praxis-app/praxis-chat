import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { InstanceRolePermission } from './instance-role-permission.entity';

@Entity()
export class InstanceRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  color: string;

  @OneToMany(
    () => InstanceRolePermission,
    (rolePermission) => rolePermission.instanceRole,
    {
      cascade: true,
    },
  )
  permissions: InstanceRolePermission[];

  @ManyToMany(() => User, (user) => user.instanceRoles)
  @JoinTable()
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
