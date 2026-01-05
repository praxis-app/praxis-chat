import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Server } from '../servers/entities/server.entity';

@Entity()
export class InstanceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Server)
  @JoinColumn()
  defaultServer: Server;

  @Column({ type: 'uuid' })
  defaultServerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
