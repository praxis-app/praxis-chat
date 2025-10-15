import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Server } from './server.entity';

@Entity()
@Unique(['userId', 'serverId'])
export class ServerMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.serverMembers, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Server, (server) => server.members, {
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
