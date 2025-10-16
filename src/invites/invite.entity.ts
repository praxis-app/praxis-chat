import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Server } from '../servers/entities/server.entity';
import { User } from '../users/user.entity';

@Entity()
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ default: 0 })
  uses: number;

  @Column({ nullable: true })
  maxUses?: number;

  @ManyToOne(() => User, (user) => user.invites, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Server, (server) => server.invites, {
    onDelete: 'CASCADE',
  })
  server: Server;

  @Column({ type: 'uuid' })
  serverId: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
